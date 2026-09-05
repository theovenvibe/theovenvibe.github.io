/**
 * Reports cart activity to the backend Worker — Phase 7's cart-abandonment
 * nudge needs to know a basket exists server-side, since the cart itself
 * lives only in this browser's localStorage (cart.ts's own "no names, no
 * prices" restraint stays true here too: only a count and a timestamp ever
 * leave the device, never what's actually in the basket).
 *
 * Debounced so a burst of stepper clicks sends one ping, not one per click.
 */
import { reportStage } from './campaign';

let timer: ReturnType<typeof setTimeout> | undefined;

export function pingCartActivity(workerUrl: string, deviceId: string, itemCount: number): void {
  if (!workerUrl) return;
  // The funnel's basket step rides on the call that already means "a basket
  // exists", rather than a second hook of its own next to it — one place to
  // get wrong instead of two, and it cannot drift out of step with the nudge.
  //
  // Not debounced with the ping below: the Worker keeps one row per device per
  // stage, so a burst of stepper clicks is already one basket. Sent only when
  // something is actually in the bag, because emptying a cart is not reaching
  // one.
  if (itemCount > 0) reportStage(workerUrl, 'cart');
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetch(`${workerUrl}/cart-activity`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, item_count: itemCount }),
    }).catch(() => {});
  }, 2000);
}
