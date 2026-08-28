/**
 * Tell the Worker what happened when we asked somebody for something.
 *
 * Shared by the two dialogs that ask a customer for a permission — notifications
 * (PushSubscribe.astro) and app install (PwaInstall.astro). Before this existed
 * the only number available was "2 push subscriptions", both of them the owner's
 * own test devices, and that cannot distinguish an ask nobody sees from an ask
 * everybody refuses. Those need opposite fixes.
 *
 * Fire-and-forget on purpose: this is the owner's analytics, and it must never
 * be the reason a customer's tap feels slow or an error reaches their screen.
 *
 * Nothing here may import `lib/data.ts` — that reads menu.json with readFileSync
 * at build time and bundling it for the browser kills the whole module.
 */
import { getDeviceId } from './device';

export type AskKind = 'push' | 'install';
export type AskOutcome = 'shown' | 'yes_granted' | 'yes_denied' | 'no' | 'dismissed';

function platform(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

export function reportAsk(
  workerUrl: string,
  kind: AskKind,
  outcome: AskOutcome,
  trigger: string | null,
): void {
  if (!workerUrl) return;
  try {
    void fetch(`${workerUrl}/push-ask-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        outcome,
        trigger,
        page: location.pathname,
        platform: platform(),
        device_id: getDeviceId(),
      }),
      // The tap that reports 'yes' also opens a native prompt and can navigate;
      // keepalive is what stops the row being lost when that happens.
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never worth surfacing to a customer.
  }
}
