/**
 * Which campaign brought this browser here, and how far it got.
 *
 * The owner's question, 2026-09-05: for every code he makes, how many people
 * opened the link, built a basket, reached checkout, and tapped through to
 * WhatsApp? None of that was recorded anywhere. A campaign that failed because
 * nobody opened the link looked exactly like one that failed because the menu
 * put people off, and those need opposite fixes.
 *
 * FIRST touch wins, exactly like `lib/source.ts`. Somebody who arrives from
 * the pizza-box QR and comes back a week later by typing the address was still
 * brought here by the box, and the owner's rule is one campaign per person
 * ever — so a second code must never overwrite the first.
 *
 * Every call here is fire-and-forget with `keepalive` (AGENTS.md rule 5).
 * Measurement must never be able to hold up or break an order; a funnel with a
 * gap in it is a far smaller problem than a customer who could not order.
 *
 * Nothing here may import `lib/data.ts` — it reads menu.json with readFileSync
 * at build time, and bundling it for the browser kills the whole module.
 */
import { getDeviceId } from './device';

const KEY = 'ov_campaign';

/** The stages this browser can observe. The claim, the order and the payment
 *  are recorded by the Worker from its own tables, never from here. */
export type CampaignStage = 'link_open' | 'cart' | 'checkout' | 'handoff';

/**
 * Remember the code from a `?c=CODE` link.
 *
 * Safe to call on every page load — a no-op once something is stored.
 */
export function rememberCampaign(): void {
  try {
    if (localStorage.getItem(KEY)) return;
    const c = new URLSearchParams(location.search).get('c');
    if (!c) return;
    const clean = c.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40);
    if (clean) localStorage.setItem(KEY, clean);
  } catch {
    // Private mode. The funnel loses one visitor and nothing else breaks.
  }
}

/** The code this browser arrived with, if it ever carried one. */
export function rememberedCampaign(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * Report one stage.
 *
 * Sends nothing at all when this browser carries no campaign code, which is
 * most visitors: a funnel is about campaigns, and recording everybody else
 * would spend the free tier's write budget on rows no screen shows.
 *
 * The Worker deduplicates on (code, stage, device), so calling this twice for
 * the same person costs one refused insert and changes no number. That is why
 * there is no debounce here.
 *
 * `name` and `phone` are sent ONLY on the checkout stage, and only because the
 * Worker needs them to raise the "somebody is at checkout and has not ordered"
 * alert on its private claim topic. They never reach the public ntfy topic —
 * see AGENTS.md rule 11.
 */
export function reportStage(
  workerUrl: string,
  stage: CampaignStage,
  extra: { name?: string; phone?: string } = {},
): void {
  const code = rememberedCampaign();
  if (!code || !workerUrl) return;
  try {
    fetch(`${workerUrl}/campaign/event`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, stage, device_id: getDeviceId(), ...extra }),
    }).catch(() => {});
  } catch {
    // Never throws into a page. See the note at the top of this file.
  }
}
