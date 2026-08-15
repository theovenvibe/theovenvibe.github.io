/**
 * Publishing to the kitchen's ntfy topic.
 *
 * One implementation, because there are now two things worth ringing a phone
 * for — an order being placed on this site, and a customer leaving for Zomato
 * or Swiggy — and they must not drift apart in how they escape headers or how
 * they fail.
 *
 * ## The rule that must survive every future edit
 *
 * Free ntfy has **no access control**: the topic name is the password, it ships
 * in the page source, and anyone who reads it can subscribe. So a payload here
 * should be assumed public. **Never pass a customer's name, phone number or
 * address to this function.** `/checkout/` collects those, and `order-form.ts`
 * deliberately builds a separate PII-free text for the alert.
 * See `skills/setup-order-alerts.md`.
 */

export interface NtfyMessage {
  /** Header line. Forced to ASCII — see below. */
  title: string;
  body: string;
  /** ntfy priority. `urgent` is what makes Android treat it as an alarm. */
  priority?: 'min' | 'low' | 'default' | 'high' | 'urgent';
  /** Emoji shortcodes ntfy renders as tags, e.g. "pizza". */
  tags?: string;
}

/**
 * ntfy sends headers as latin-1, so a ₹ or an en-dash in a title fails the
 * whole request. The body is sent as UTF-8 and keeps everything.
 */
export function asciiHeader(s: string): string {
  return s
    .replace(/₹/g, 'Rs ')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

/**
 * Fire and forget. Returns nothing and throws nothing: a failed alert must
 * never block what the customer was doing.
 *
 * `keepalive` matters — every caller fires this immediately before the tab
 * navigates away (to WhatsApp, to Zomato), and a normal fetch is cancelled
 * exactly then, which is the moment the alert is most worth sending.
 */
export function publishNtfy(topic: string, msg: NtfyMessage): void {
  if (!topic || !msg.body) return;
  const headers: Record<string, string> = {
    Title: asciiHeader(msg.title),
    Priority: msg.priority ?? 'urgent',
  };
  if (msg.tags) headers.Tags = msg.tags;

  fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: 'POST',
    keepalive: true,
    headers,
    body: msg.body,
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
