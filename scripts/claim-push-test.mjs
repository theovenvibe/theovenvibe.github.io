/**
 * The expiry-reminder ask on /claim/ (backend repo: docs/campaign/PRD.md, Phase 3).
 *
 *   npm run build && npx astro preview --port 4334
 *   node scripts/claim-push-test.mjs      # needs a live campaign called IG-QA
 *
 * The point of these tests is the THREE states where the card must NOT appear:
 * permission already granted, permission permanently denied, and no push
 * support. A button that quietly does nothing is worse than no button, and on
 * the denied path the browser will never prompt again for this origin - so
 * offering it would be a lie we cannot take back.
 *
 * Headless Chromium reports Notification.permission as 'denied' out of the
 * box, which is why every scenario stubs the permission it means to test
 * rather than inheriting the browser's mood.
 *
 * Claims are real rows in the real database. Delete them afterwards.
 */
import pw from '/home/milanbeherazyx/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const S = process.env.S, BASE = 'http://localhost:4334';
const pass = [], fail = [];
const ck = (n, ok, x='') => (ok ? pass : fail).push(n + (x ? ' — ' + x : ''));
const phone = () => '9' + String(Math.floor(Math.random() * 1e9)).padStart(9, '0');

// Headless Chromium reports Notification.permission as 'denied' out of the
// box, so each scenario states the permission it is testing explicitly rather
// than inheriting whatever the browser felt like.
const stub = (perm) => `Object.defineProperty(Notification, 'permission', { get: () => '${perm}' });`;

const b = await chromium.launch({ args: ['--disable-web-security', '--disable-site-isolation-trials'] });

async function claimWith(init) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  await page.goto(BASE + '/claim/?c=IG-QA');
  await page.waitForSelector('#claimForm:not([hidden])', { timeout: 15000 });
  await page.fill('#claimName', 'Push Tester');
  await page.fill('#claimPhone', phone());
  await page.check('#claimConsent');
  await page.click('#claimSubmit');
  await page.waitForSelector('#claimDone:not([hidden])', { timeout: 15000 });
  return { ctx, page };
}

// A. Permission unanswered — the one case where the ask can work.
{
  const { ctx, page } = await claimWith(stub('default'));
  ck('Reminder is offered when permission is unanswered', await page.locator('#claimRemind').isVisible());
  const tops = await page.evaluate(() =>
    ['#claimDoneAmount', '#claimRemind', '#claimDone .claim-submit']
      .map((s) => document.querySelector(s)?.getBoundingClientRect().top ?? -1));
  ck('Balance, then the ask, then Order now — one ask at a time',
     tops[0] < tops[1] && tops[1] < tops[2], JSON.stringify(tops));
  await page.locator('#claimDone').screenshot({ path: S + '/claim-remind.png' });

  await page.click('#claimRemindNo');
  await page.waitForTimeout(200);
  ck('"No thanks" hides the ask', !(await page.locator('#claimRemind').isVisible()));
  ck('...without touching the native prompt, so we can ask another day',
     (await page.evaluate(() => Notification.permission)) === 'default');
  await ctx.close();
}

// A2. Saying yes must always end in a plain answer, granted or not.
{
  const { ctx, page } = await claimWith(stub('default') + `
    window.Notification.requestPermission = async () => 'granted';`);
  await page.click('#claimRemindYes');
  await page.waitForSelector('#claimRemindDone:not([hidden])', { timeout: 15000 });
  const msg = await page.textContent('#claimRemindDone');
  ck('Saying yes always gives a plain answer', !!msg && msg.trim().length > 10, msg?.trim());
  ck('...and the buttons are gone afterwards',
     !(await page.locator('#claimRemindYes').isVisible()));
  await page.locator('#claimDone').screenshot({ path: S + '/claim-remind-after.png' });
  await ctx.close();
}

// B/C/D. Every state where saying yes CANNOT work must show no button at all.
for (const [name, init] of [
  ['already granted', stub('granted')],
  ['permanently denied', stub('denied')],
  ['push unsupported', 'delete window.PushManager;'],
]) {
  const { ctx, page } = await claimWith(init);
  ck(`No dead button when ${name}`, !(await page.locator('#claimRemind').isVisible()));
  ck(`...and the claim itself still succeeded (${name})`, await page.locator('#claimDone').isVisible());
  await ctx.close();
}

console.log('\nPASS (' + pass.length + ')'); for (const p of pass) console.log('  ok  ' + p);
if (fail.length) { console.log('\nFAIL (' + fail.length + ')'); for (const f of fail) console.log('  XX  ' + f); }
await b.close();
process.exit(fail.length ? 1 : 0);
