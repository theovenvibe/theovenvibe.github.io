/**
 * The signal that ties the push soft-ask to "just sent an order" (PRD §8.2:
 * the card only appears after the customer taps Send order on WhatsApp and
 * returns to the tab — never on page load, never before an order).
 *
 * `checkout.astro` sets this at the same moment it POSTs the order;
 * `PushSubscribe.astro` (rendered on every page, since the customer returns
 * to whichever tab was open) reads and clears it on the next `visibilitychange`.
 * localStorage rather than sessionStorage: iOS Safari can reload a
 * backgrounded tab under memory pressure while WhatsApp is open, which would
 * wipe sessionStorage before the customer ever comes back.
 */
const KEY = 'ovenvibe.order_just_sent_at';
const VALID_FOR_MS = 15 * 60 * 1000;

export function markOrderJustSent(): void {
  try {
    window.localStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Missing this once just means the soft-ask doesn't fire this visit.
  }
}

/** Reads and clears the flag — a one-shot check, never re-triggers on a stale value. */
export function consumeOrderJustSent(): boolean {
  try {
    const raw = window.localStorage.getItem(KEY);
    window.localStorage.removeItem(KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < VALID_FOR_MS;
  } catch {
    return false;
  }
}
