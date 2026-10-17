import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
const config = readFileSync('astro.config.mjs', 'utf8');
const origin = config.match(/export const SITE_URL = '([^']+)'/)[1];
const sitemap = readFileSync(join(root, 'sitemap-0.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.ok(urls.length > 10, 'Public pages are discoverable');
const source = JSON.parse(readFileSync('menu.json', 'utf8'));
const renderedMenu = readFileSync(join(root, 'menu/index.html'), 'utf8');
const graphs = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1])['@graph'] ?? []);
const menu = graphs(renderedMenu).find(n => n['@type']?.includes('Restaurant')).hasMenu;
const records = menu.hasMenuSection.flatMap(s => s.hasMenuItem);
const published = JSON.parse(readFileSync(join(root, 'menu.json'), 'utf8'));
// The published catalogue already applies time-limited campaign expiry.
const expected = [...published.Menu_Items.filter(i => i.status === 'available').map(i => ({code: i.product_code, price:i.price, kind:'item'})), ...published.Combos.filter(i => i.status === 'available').map(i => ({code:i.combo_code,price:i.combo_price,kind:'combo'}))];
assert.equal(records.length, expected.length, 'Schema and live catalogue counts agree');
for (const entry of expected) {
  assert.ok(source[entry.kind === 'item' ? 'Menu_Items' : 'Combos'].some(i => String(i[entry.kind === 'item' ? 'product_code' : 'combo_code']) === String(entry.code)));
  const id = `dish-${entry.kind}-${entry.code}`;
  assert.ok(renderedMenu.includes(`id="${id}"`), `Real menu anchor: ${id}`);
  const node = records.find(i => i['@id'] === `${origin}/menu/#${id}`);
  assert.ok(node, `Stable entity: ${id}`);
  assert.equal(node.offers.price, entry.price, `Catalogue price parity: ${id}`);
  assert.equal(node.suitableForDiet, 'https://schema.org/VegetarianDiet');
}
const docs = new Map();
for (const url of urls) {
  const u = new URL(url);
  assert.equal(u.origin, origin);
  assert.ok(u.pathname.endsWith('/'), 'One trailing-slash canonical convention');
  assert.ok(!['/checkout/','/offer/','/claim/','/r/','/404/'].includes(u.pathname), 'No utility page in sitemap');
  const file = join(root, u.pathname, 'index.html');
  assert.ok(existsSync(file), file);
  const html = readFileSync(file, 'utf8');
  docs.set(u.pathname, html);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `Canonical: ${url}`);
  assert.doesNotMatch(html, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `One H1: ${url}`);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.doesNotMatch(html, /<img(?![^>]*\balt=)[^>]*>/);
  assert.doesNotMatch(html, /Bhuk\s+Lagla/i, 'Separate business identity');
  assert.ok(graphs(html).length > 0, `Valid JSON-LD: ${url}`);
  // Template-literal regexes in JS may contain Unicode escapes; only actual
  // rendered pictographs are disallowed by this site's UI policy.
  assert.doesNotMatch(html, /[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/u, `No rendered emoji: ${url}`);
  assert.doesNotMatch(html, /\b(chicken|mutton|prawn|keema)\b/i);
  for (const n of graphs(html)) {
    if (n.aggregateRating) {
      const rating = JSON.parse(readFileSync('site.config.json','utf8')).rating;
      assert.equal(Number(n.aggregateRating.ratingValue), rating.value);
      assert.equal(Number(n.aggregateRating.reviewCount), rating.count);
    }
  }
}
// Broken guide-to-menu fragments are customer-visible failures, even when
// every page itself returns 200. Validate static internal anchors too.
for (const [path, html] of docs) {
  for (const m of html.matchAll(/<a\b[^>]*href="([^"<>]+)"/g)) {
    const href = m[1].replaceAll('&amp;', '&');
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const target = new URL(href, `${origin}${path}`);
    if (!target.hash || !docs.has(target.pathname)) continue;
    const id = decodeURIComponent(target.hash.slice(1));
    assert.ok(docs.get(target.pathname).includes(`id="${id}"`), `Fragment ${path} -> ${href}`);
  }
}
console.log(JSON.stringify({result:'passed',pages:urls.length,menuEntries:expected.length,checks:'metadata, canonical, sitemap exclusions, JSON-LD, source price parity, menu anchors, internal fragments, ratings, alt text, business identity and pure-veg/emoji policy'},null,2));
