/**
 * Browser test for /claim/ (backend repo: docs/campaign/PRD.md, Phase 2).
 *
 *   npm run build && npx astro preview --port 4333
 *   node scripts/claim-page-test.mjs
 *
 * Drives the real page against the real Worker and the real D1, because the
 * two faults this page had were invisible to a passing test: the floating
 * WhatsApp and Dough buttons sat on top of the form, and the wrap had no side
 * padding so labels ran into the edge of a 360px screen. Both were found in a
 * screenshot. Look at the PNGs it writes, do not only read the PASS list.
 *
 * It needs a live campaign called IG-QA and a closed one called IG-QACLOSED.
 * Create them, and DELETE the claims afterwards - they are real rows in the
 * real database.
 *
 * Playwright is not a dependency of this project; the import points at the
 * npx cache.
 */
import pw from '/home/milanbeherazyx/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const S = process.env.S, BASE = 'http://localhost:4333';
const pass = [], fail = [];
const ck = (n, ok, x='') => (ok ? pass : fail).push(n + (x ? ' — ' + x : ''));

// The Worker restricts CORS to the production origin, which is correct - and
// means a page served from localhost cannot call it. Disabled for this test
// run only; production is served from the allowed origin.
const b = await chromium.launch({ args: ['--disable-web-security', '--disable-site-isolation-trials'] });
const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, bypassCSP: true });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('  [console]', m.text()); });

const vis = async (id) => page.locator('#' + id).isVisible();
const phone = () => '9' + String(Date.now()).slice(-9);

// 1. No campaign code at all
await page.goto(BASE + '/claim/');
await page.waitForTimeout(600);
ck('No ?c= shows the closed card', await vis('claimClosed'));

// 2. A campaign whose window has ended
await page.goto(BASE + '/claim/?c=IG-QACLOSED');
await page.waitForTimeout(1500);
ck('Finished campaign shows the closed card', await vis('claimClosed'));
ck('...and not the form', !(await vis('claimForm')));

// 3. Live campaign
await page.goto(BASE + '/claim/?c=IG-QA');
await page.waitForSelector('#claimForm:not([hidden])', { timeout: 10000 });
ck('Live campaign shows the form', true);
ck('Amount comes from the Worker, not the markup',
   (await page.textContent('#claimAmount')) === '40');

// 4. Client-side guards
await page.click('#claimSubmit');
await page.waitForTimeout(300);
ck('Empty name is caught', (await page.textContent('#claimError')).includes('name'));
await page.fill('#claimName', 'QA Tester');
await page.fill('#claimPhone', '12345');
await page.click('#claimSubmit');
await page.waitForTimeout(300);
ck('Bad phone is caught', (await page.textContent('#claimError')).includes('10-digit'));
const p1 = phone();
await page.fill('#claimPhone', p1);
await page.click('#claimSubmit');
await page.waitForTimeout(300);
ck('Unticked consent is caught', (await page.textContent('#claimError')).includes('tick'));

// 5. The happy path, against the live Worker and real D1
await page.check('#claimConsent');
await page.fill('#claimArea', 'Jyotinagar');
await page.click('#claimSubmit');
await page.waitForSelector('#claimDone:not([hidden])', { timeout: 15000 });
ck('Claim succeeds', true);
const doneTxt = (await page.locator('#claimDone').innerText()).replace(/\s+/g, ' ');
ck('Shows the amount added', /40 added/.test(doneTxt), doneTxt.slice(0, 90));
ck('Shows a real expiry date', /Spend it before \w+ \d| \d+ \w+/.test(doneTxt), doneTxt);
await page.locator('#claimDone').screenshot({ path: S + '/claim-done.png' });

// 6. Same number again → the nudge, not a dead end
await page.goto(BASE + '/claim/?c=IG-QA');
await page.waitForSelector('#claimForm:not([hidden])', { timeout: 10000 });
await page.fill('#claimName', 'QA Tester');
await page.fill('#claimPhone', p1);
await page.check('#claimConsent');
await page.click('#claimSubmit');
await page.waitForSelector('#claimKnown:not([hidden])', { timeout: 15000 });
const knownTxt = (await page.locator('#claimKnown').innerText()).replace(/\s+/g, ' ');
ck('Second claim shows the balance nudge', /₹40 Dough waiting/.test(knownTxt), knownTxt.slice(0, 120));
ck('...with an Order now button', await page.locator('#claimKnown a').count() === 1);
await page.locator('#claimKnown').screenshot({ path: S + '/claim-known.png' });

// 7. Layout
await page.goto(BASE + '/claim/?c=IG-QA');
await page.waitForSelector('#claimForm:not([hidden])');
const [sw, iw] = await page.evaluate(() => [document.body.scrollWidth, window.innerWidth]);
ck('No horizontal scroll at 360px', sw <= iw, sw + ' vs ' + iw);
ck('noindex is set', (await page.locator('meta[name="robots"]').getAttribute('content') || '').includes('noindex'));
await page.screenshot({ path: S + '/claim-form.png', fullPage: true });

console.log('\nPASS (' + pass.length + ')'); for (const p of pass) console.log('  ok  ' + p);
if (fail.length) { console.log('\nFAIL (' + fail.length + ')'); for (const f of fail) console.log('  XX  ' + f); }
console.log('\ntest number used: ' + p1);
await b.close();
process.exit(fail.length ? 1 : 0);
