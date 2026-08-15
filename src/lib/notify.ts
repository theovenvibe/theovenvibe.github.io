/**
 * Alerting the kitchen — an order being placed on this site, or a customer
 * leaving for Zomato or Swiggy. One implementation so the two never drift
 * apart in how they fail.
 *
 * Phase 0 moved this behind the Worker (`the-oven-vibe-backend`, POST
 * /alert): the site no longer talks to ntfy.sh directly, and no longer knows
 * the topic name — that is a Worker secret now, never shipped to this
 * public, static site. See HANDOFF.md in the backend repo.
 */

export interface NtfyMessage {
  /** Header line. */
  title: string;
  body: string;
  /** ntfy priority. `urgent` is what makes Android treat it as an alarm. */
  priority?: 'min' | 'low' | 'default' | 'high' | 'urgent';
  /** Emoji shortcodes ntfy renders as tags, e.g. "pizza". */
  tags?: string;
}

/**
 * Fire and forget. Returns nothing and throws nothing: a failed alert must
 * never block what the customer was doing.
 *
 * `keepalive` matters — every caller fires this immediately before the tab
 * navigates away (to WhatsApp, to Zomato), and a normal fetch is cancelled
 * exactly then, which is the moment the alert is most worth sending.
 */
export function publishNtfy(workerUrl: string, msg: NtfyMessage): void {
  if (!workerUrl || !msg.body) return;
  fetch(`${workerUrl}/alert`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  }).catch(() => {});
}

/**
 * Guards against one action ringing every phone twice — a double tap, or a
 * click handler that fires alongside a navigation. Keyed per call site.
 */
export function makeOnce(): (key: string) => boolean {
  let last = '';
  return (key: string) => {
    if (key === last) return false;
    last = key;
    return true;
  };
}
