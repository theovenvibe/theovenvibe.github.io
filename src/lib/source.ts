/**
 * Where a customer came from.
 *
 * On 2026-08-28 the owner asked which of his customers came from Instagram.
 * The answer was 4 of 74 — not because the rest came from somewhere else, but
 * because nothing recorded it. Only the Instagram claim campaign left a trace,
 * and a normal order left none at all. That cannot be fixed backwards; this
 * fixes it forwards.
 *
 * FIRST touch wins, deliberately. Somebody who arrives from Instagram, browses,
 * leaves, then comes back by typing the address a week later was still brought
 * here by Instagram — recording that second visit as "direct" would quietly
 * credit the channel that did nothing. So the first source seen is written once
 * and never overwritten.
 *
 * Nothing here may import `lib/data.ts`: that reads menu.json with readFileSync
 * at build time, and bundling it for the browser kills the whole module.
 */
const SOURCE_KEY = 'ov_source';
const SOURCE_AT_KEY = 'ov_source_at';

/**
 * Read the source from the URL and the referrer.
 *
 * An explicit `utm_source` always wins — it is the only signal somebody chose
 * to send, so a campaign link is never second-guessed by a referrer header.
 */
function detect(): string | null {
  try {
    const params = new URLSearchParams(location.search);
    const utm = params.get('utm_source') || params.get('source') || params.get('ref');
    if (utm) return utm.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30) || null;

    const ref = document.referrer;
    if (!ref) return null;

    let host: string;
    try {
      host = new URL(ref).hostname.toLowerCase();
    } catch {
      return null;
    }
    // Our own pages are not a source — they are navigation.
    if (host.endsWith('theovenvibe.github.io') || host === location.hostname) return null;

    // In-app browsers report the app's own domain, which is the signal we
    // actually want: Instagram's browser is where a lot of this traffic lands,
    // and it is also the one that cannot install a PWA at all.
    if (host.includes('instagram')) return 'instagram';
    if (host.includes('facebook') || host.includes('fb.')) return 'facebook';
    if (host.includes('whatsapp')) return 'whatsapp';
    if (host.includes('google')) return 'google';
    if (host.includes('zomato')) return 'zomato';
    if (host.includes('swiggy')) return 'swiggy';
    if (host.includes('youtube')) return 'youtube';
    return host.replace(/^www\./, '').slice(0, 30);
  } catch {
    return null;
  }
}

/**
 * Record the source once, on the first page of the first visit.
 *
 * Safe to call on every page load — it is a no-op once something is stored.
 */
export function rememberSource(): void {
  try {
    if (localStorage.getItem(SOURCE_KEY)) return;
    const found = detect();
    // 'direct' is stored explicitly rather than left blank, so a later visit
    // from Instagram cannot overwrite somebody who genuinely came direct.
    localStorage.setItem(SOURCE_KEY, found ?? 'direct');
    localStorage.setItem(SOURCE_AT_KEY, new Date().toISOString());
  } catch {
    // Private mode. One order arrives without a source; nothing breaks.
  }
}

/** What brought this browser here, if we ever knew. */
export function rememberedSource(): string | null {
  try {
    return localStorage.getItem(SOURCE_KEY);
  } catch {
    return null;
  }
}
