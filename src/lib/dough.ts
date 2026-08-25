/**
 * Dough on the customer's side.
 *
 * Read-only and fire-and-forget, like everything else the site asks the Worker
 * (AGENTS.md rule 5). If this fails the customer simply sees no balance and the
 * order goes through at full price — a loyalty read must never block an order.
 *
 * The cap is computed here too, but only so the customer sees the limit before
 * they commit. The Worker recomputes it from the stored basket and takes the
 * smaller of the two, so nothing here needs to be trusted.
 */
export interface DoughState {
  balance: number;
  expires_at: string | null;
  capPct: number;
}

export const NO_DOUGH: DoughState = { balance: 0, expires_at: null, capPct: 0.1 };

/**
 * One cache, one owner.
 *
 * The floating bubble resolves a customer by device; checkout resolves them by
 * the phone number they just typed. On a shared handset those are two different
 * people, and whichever painted last used to win. Anything that learns a fresh
 * balance publishes it here, and everything showing one listens - so the number
 * on screen can never disagree with itself.
 */
export const DOUGH_CACHE_KEY = 'ov_dough_balance';
/**
 * The number this browser's owner orders with.
 *
 * Written by checkout and by the "Check your Dough" form, read by the floating
 * button. Without it the button can only recognise a device that has allowed
 * notifications, which is almost nobody — so a customer with a real balance saw
 * no button at all and concluded their Dough had vanished.
 */
export const DOUGH_PHONE_KEY = 'ov_phone';

export function rememberPhone(phone: string): void {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits)) return;
  try {
    localStorage.setItem(DOUGH_PHONE_KEY, digits);
  } catch {
    // Private mode. The balance still resolves for as long as this page lives.
  }
}

export function rememberedPhone(): string {
  try {
    return localStorage.getItem(DOUGH_PHONE_KEY) ?? '';
  } catch {
    return '';
  }
}
export const DOUGH_EVENT = 'ov:dough';

export function publishDough(balance: number): void {
  try {
    sessionStorage.setItem(DOUGH_CACHE_KEY, String(balance));
  } catch {
    // Private browsing refuses storage; the event still fires, which is enough.
  }
  window.dispatchEvent(new CustomEvent(DOUGH_EVENT, { detail: { balance } }));
}

export async function fetchDough(worker: string, deviceId: string, phone: string): Promise<DoughState> {
  if (!worker) return NO_DOUGH;
  try {
    const res = await fetch(`${worker}/dough/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, phone }),
    });
    if (!res.ok) return NO_DOUGH;
    const d = (await res.json()) as { balance?: number; expires_at?: string | null; cap_pct?: number };
    return {
      balance: Math.max(0, Math.floor(Number(d.balance) || 0)),
      expires_at: d.expires_at ?? null,
      capPct: Number(d.cap_pct) || 0.1,
    };
  } catch {
    return NO_DOUGH;
  }
}

/**
 * How much may be used on this basket.
 *
 * Two limits, and the tighter one wins: 10% of the basket, and never so much
 * that the order falls under its own delivery minimum. The second is what stops
 * Dough shrinking a basket the kitchen would rather grow.
 */
export function usableDough(state: DoughState, spendableTotal: number, minimum: number): number {
  const cap = Math.floor(spendableTotal * state.capPct);
  const headroom = Math.max(0, spendableTotal - minimum);
  return Math.max(0, Math.min(state.balance, cap, headroom));
}

/**
 * The one sentence explaining why Dough can be smaller than expected.
 *
 * Exported from here so checkout, the Dough page, the FAQ and the price
 * calculator all say the same thing. Four copies of a rule is four chances for
 * one of them to be quietly wrong after the next change.
 */
export const DOUGH_OFFER_RULE =
  'Dough works on full-price items. Items already on offer, and drinks, are not included — one discount at a time.';

/** Catalogue codes Dough never touches: drinks sell at MRP. Mirrors the Worker. */
export const MRP_CODES = new Set(['900000001', '900000002']);

/** Strips the `item-` / `combo-` / `addon-` prefix the cart puts on a code. */
export const bareCode = (id: string): string => id.replace(/^(item|combo|addon)-/, '');

/**
 * The part of the basket Dough may come off — full-price food only.
 *
 * The Worker recomputes this from the stored order and takes the smaller of the
 * two, so this exists to keep the number on screen honest rather than to be
 * trusted. Showing a cap the Worker will refuse is worse than showing none.
 */
export function spendableTotal(
  lines: readonly { id: string; price: number; qty: number }[],
  offerCodes: ReadonlySet<string>,
): number {
  let total = 0;
  for (const l of lines) {
    const code = bareCode(l.id);
    if (offerCodes.has(code) || MRP_CODES.has(code)) continue;
    total += l.price * l.qty;
  }
  return Math.max(0, total);
}

/** "3 Oct" — short, because it sits inside a sentence. */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}
