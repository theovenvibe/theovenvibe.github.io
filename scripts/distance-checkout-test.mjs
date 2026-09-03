/**
 * Browser test for the distance hint on the real checkout page.
 *
 *   (backend) npx wrangler dev --port 8799 --local
 *   (site)    npm run dev
 *             node scripts/distance-checkout-test.mjs
 *
 * Needs the local harness wiring described in the backend's PROGRESS notes:
 * site.config.json pointed at localhost:8799, the worker_url regex relaxed, and
 * http://localhost:4321 in the Worker's ALLOWED_ORIGINS. All three are
 * harness-only and must be reverted.
 *
 * Seeded customer 9812300001 has two confirmed delivery orders — 2-4 km on
 * 1 September and 0-2 km on 10 August — which is the case the whole feature
 * turns on: somebody who orders from two places, where the most recent is a
 * default and not a verdict.
 *
 * Driven in the page rather than against the endpoint because that is where
 * this repo's bugs have actually lived: a hint that resolves correctly and
 * never reaches the radios is exactly the failure a green build hides.
 */
import pw from '/home/milanbeherazyx/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const SITE = 'http://localhost:4321';
const pass = [], fail = [];
// The detail is printed only on a failure. A passing line reading
// "no /orders request seen" beside a tick is how a green run gets misread.
const ck = (n, ok, x = '') => (ok ? pass.push(n) : fail.push(n + (x ? ' — ' + x : '')));

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
// A basket, so the page can actually build and file an order. Seeded in
// storage rather than clicked through the menu: what is under test here is the
// distance on the payload, not the cart.
await ctx.addInitScript(() =>
  window.localStorage.setItem(
    'ovenvibe.cart.v2',
    // Five, not three. Filling in the 2-4 km band raises the order minimum
    // from Rs 249 to Rs 399, and on a day this item is running an offer a
    // three-pizza basket falls short of it — the send button then disables and
    // the payload check below fails for a reason that has nothing to do with
    // distance. Sized to clear the highest minimum at the lowest price.
    JSON.stringify([{ id: 'item-745802369', qty: 5, addons: {} }]),
  ),
);
const p = await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error') console.log('  [console]', m.text()); });

await p.goto(SITE + '/checkout/', { waitUntil: 'networkidle' });

// A first-time customer must see exactly what they saw before this feature.
const beforeHidden = await p.locator('#distanceHint').isHidden();
const beforeBand = await p.locator('input[name="distance"]:checked').getAttribute('value');
ck('nothing shown before a number is typed', beforeHidden, 'hint row visible');
ck('the default band is untouched for a stranger', beforeBand === 'under2', String(beforeBand));

// ------------------------------------------------------------------ the hint
await p.fill('#custPhone', '9812300001');
await p.locator('#custPhone').blur();
await p.waitForSelector('#distanceHint:not([hidden])', { timeout: 10000 });

const band = await p.locator('input[name="distance"]:checked').getAttribute('value');
ck('the band they last ordered from is filled in', band === '2to4', String(band));

const km = await p.inputValue('#kmInput');
ck('their exact distance comes with it', km === '3.2', km);

const chips = await p.locator('#distanceHint button').allInnerTexts();
ck('the other place they order from is offered as one tap', chips.length === 1 && chips[0] === '0-2 km', JSON.stringify(chips));

// ------------------------------------------------------------- tapping a chip
await p.locator('#distanceHint button').first().click();
const afterBand = await p.locator('input[name="distance"]:checked').getAttribute('value');
const afterKm = await p.inputValue('#kmInput');
ck('tapping the other band switches to it', afterBand === 'under2', String(afterBand));
ck('and brings that band\'s own distance, not the previous one', afterKm === '1.5', afterKm);

const afterChips = await p.locator('#distanceHint button').allInnerTexts();
ck(
  'the row now offers the band they are NOT on',
  afterChips.length === 1 && afterChips[0] === '2-4 km',
  JSON.stringify(afterChips),
);

// --------------------------------------------------- the customer overrules it
// The whole point is that they can change it. Picking a radio by hand must win
// and must clear the remembered number, exactly as it did before the feature.
await p.locator('input[name="distance"][value="beyond4"]').check();
const overridden = await p.inputValue('#kmInput');
ck('picking a band by hand clears the suggested distance', overridden === '', overridden);

// ------------------------------------------------------- an unknown number
await p.fill('#custPhone', '9812399999');
await p.locator('#custPhone').blur();
await p.waitForTimeout(1500);
const unknownHidden = await p.locator('#distanceHint').isHidden();
ck('a number we have never seen shows nothing', unknownHidden, 'hint row visible');

// ------------------------------------------------------- what actually gets sent
// The bug this feature is built on top of: checkout used to put the typed
// number in the band field, so "3.2 km" was written to customers.distance_band
// where a slab label belongs. Read the real request rather than trusting the
// helper that builds it.
// A fresh page: the checks above deliberately left the form on "more than
// 4 km", which hides the send button entirely and would look like a bug in the
// payload rather than the state this test put it in.
await p.reload({ waitUntil: 'networkidle' });

let payload = null;
// Listen rather than intercept, and let the order reach the local Worker for
// real. What is being checked is what the database ends up holding, and a
// stubbed response would prove only that the browser built a plausible object.
p.on('request', (r) => {
  if (!r.url().endsWith('/orders')) return;
  try { payload = JSON.parse(r.postData() || 'null'); } catch { payload = null; }
});

await p.fill('#custName', 'Two Band Test');
await p.fill('#custPhone', '9812300001');
await p.locator('#custPhone').blur();
await p.waitForSelector('#distanceHint:not([hidden])', { timeout: 10000 });
await p.fill('#kmInput', '3.2');
await p.waitForTimeout(600);
await p.locator('#waShareLink').click();
await p.waitForTimeout(2500);

ck('the order reached the Worker', payload !== null, 'no /orders request seen');
if (payload) {
  ck(
    'a typed distance is sent as a band AND a number, not a number pretending to be a band',
    payload.distance_band === '2-4 km' && payload.distance_km === 3.2,
    JSON.stringify({ band: payload.distance_band, km: payload.distance_km }),
  );
}

console.log('\nPASS');
for (const t of pass) console.log('  ✓ ' + t);
if (fail.length) {
  console.log('\nFAIL');
  for (const t of fail) console.log('  ✗ ' + t);
}
await b.close();
process.exit(fail.length ? 1 : 0);
