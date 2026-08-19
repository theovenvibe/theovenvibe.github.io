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
export function usableDough(state: DoughState, foodTotal: number, minimum: number): number {
  const cap = Math.floor(foodTotal * state.capPct);
  const headroom = Math.max(0, foodTotal - minimum);
  return Math.max(0, Math.min(state.balance, cap, headroom));
}

/** "3 Oct" — short, because it sits inside a sentence. */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}
