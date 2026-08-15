/**
 * Reports cart activity to the backend Worker — Phase 7's cart-abandonment
 * nudge needs to know a basket exists server-side, since the cart itself
 * lives only in this browser's localStorage (cart.ts's own "no names, no
 * prices" restraint stays true here too: only a count and a timestamp ever
 * leave the device, never what's actually in the basket).
 *
 * Debounced so a burst of stepper clicks sends one ping, not one per click.
 */
let timer: ReturnType<typeof setTimeout> | undefined;

export function pingCartActivity(workerUrl: string, deviceId: string, itemCount: number): void {
  if (!workerUrl) return;
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
