# Current release status (2026-09-28)

Owner explicitly resumed and approved push, merge and production deployment after
local preview review, including the final sandwich descriptions. The pause and
no-release notes below are historical checkpoints, superseded by this approval.
See docs/DELIVERY_PRICING_V2_REPORT.md for the final implementation and QA.

# Delivery pricing v2 — continuation checkpoint (2026-09-28)

## Latest owner review changes (supersede older free-delivery notes below)

- Release was approved, then explicitly paused before commits/push/merge/deploy.
  It remains paused. All six sandwich descriptions now specify jumbo bread
  or regular sandwich bread as appropriate; corrected “filing” to “filling.”

- Cheesy Garlic Bread Toast (`745802387`) is now `unavailable` per the
  item-removal skill, removing it from customer menus and order selection.
  Its catalogue record is retained for historical orders and easy restoration.

- Renamed combos in `menu.json`: `900000101` → Firecracker Fizz Combo,
  `900000102` → Corn Crunch Fizz Combo, `900000103` → Farmhouse Fizz Combo.
  Prices, included products, descriptions and stable cart IDs are unchanged.

- The owner reviewed the local site and requested inclusive normal-hours free
  delivery at ₹499 for 0–2 km, ₹899 for 2–4 km, and ₹1299 for 4–6 km.
  All three thresholds now live in `delivery.slabs[].free_above`; calculator,
  checkout, FAQ and banner derive them from that configuration. Late-night
  exclusions and separate rain/kitchen charges remain unchanged.
- Removed “Beyond 6 km: order on Zomato or Swiggy” from the homepage hero only.
  The actual service-area restriction and calculator/checkout messages remain.
- Worker itemized bill/payment message fixes and cart replacement regression
  have been implemented since the original checkpoint. The exact ₹618 food +
  ₹39 delivery + ₹50 kitchen surge = ₹707 was verified locally.
- Latest build: 0 errors, 0 warnings, 6 existing hints. Updated site delivery
  matrix and Worker `npm run verify` pass, including threshold-minus-one,
  exact threshold, threshold-plus-one and late/rain combinations.
- No merge, push or production deployment. Owner approval remains pending.
- Remaining release preparation includes the marketing print generator audit,
  final report, final Git review, and updating the older checkpoint inventory.

The owner asked to pause before context limits. Resume this task from this
checkpoint. **Do not merge, deploy, or make the new pricing live.** The owner
wants to see the local website after development and approve before any merge
or production release. The follow-up checkout requirement is explicit:

```text
Food                                   ₹618
Delivery (0–2 km)                      ₹39
Late-night kitchen reopen surge (prepaid)  ₹50
Total                                  ₹707
```

Do not label standard delivery as “Late-night delivery.”

## First actions next session

1. Read this entire file, then read both repositories' current `AGENTS.md`,
   relevant `skills/` instructions, and their `git status --short --branch`.
   The repository changes below are **uncommitted**. Do not reset, pull over,
   or discard them.
2. Resume at the unresolved Worker bill/payment messaging issue under
   **Remaining work**. Then finish implementation, QA, and UAT.
3. Show the owner the built website locally. **Wait for explicit owner approval
   before any merge or production deployment.** The owner said: “once the
   development done show me the website in local then when I approve then
   merge it and make it live.”

## Current status and release gate

- **Implementation:** substantial changes made in both repositories; open
  issues remain. Do not describe the feature as complete yet.
- **Automated checks:** currently green, details below. Passing checks do not
  cover the open Worker message error or full browser UAT.
- **QA/UAT:** local browser checks were partial; final customer journey and
  owner review have not happened.
- **Git:** two feature branches, no commits or pushes for this feature.
- **Production:** unchanged. No merge, Worker deploy, or website release.

## Repositories and branches

- Site: `D:\The Oven Vibe\theovenvibe.github.io`, branch
  `feature/delivery-pricing-v2` off `origin/develop`.
- Worker: `D:\The Oven Vibe\the-oven-vibe-backend`, branch
  `feature/delivery-pricing-v2` off `origin/main`.
- Both branches have uncommitted implementation edits. Neither has been pushed,
  merged, or deployed. They were clean before this task.
- A local site preview was started at `http://127.0.0.1:4321/` using
  `npm run preview -- --host 127.0.0.1`. Check whether it is still running;
  rebuild and restart if needed. A Chrome CUA tab was opened to its checkout.

## Read before edits

The initial user instruction required full repository inspection before any
modification, which was done. Site instructions: user-supplied `AGENTS.md`,
`skills/update-delivery-charges.md`, `skills/manage-offers.md`, `skills/qa-check.md`,
`skills/verify-site.md`, `skills/release-manager.md`, `skills/release-recovery.md`,
`skills/deploy-cicd.md`, `skills/stacked-prs.md`, `MEMORY.md`, `README.md`,
`CLAUDE.md`, `bootstrap-session.md`, `docs/CART_AND_CHECKOUT.md`, PRD/PROGRESS
relevant portions. Worker: `AGENTS.md`, `README.md`, `docs/README.md`,
`docs/WIRING.md`, `skills/deploy.md`, `skills/stacked-prs.md`, HANDOFF and docs
relevant portions. Revisit exact instructions as needed. The site release
manager requires build, QA, owner preview approval before merge. User
instructions supersede any generic standing release approval.

The source of truth is site `site.config.json` delivery settings and shared
`src/lib/pricing.ts`. The calculator and checkout both use
`src/lib/order-form.ts`, `OrderOptions.astro`, and `OrderQuote.astro`. Worker
fetches published site slabs for owner distance corrections and otherwise
stores the browser quote; it does not independently calculate full pricing.
There is no payment gateway. Customer orders via WhatsApp and the kitchen
sends a QR; owner accepts in Worker admin. Late-night acceptance has been
gated on owner-entered full amount received.

## Work implemented, pending final QA

Site: config now has 0–2 ₹39, 2–4 ₹79, 4–6 ₹119; direct radius 6 km; no
delivery minimums, afternoon rate, late-night delivery premium, or ₹149 cap;
late kitchen fee ₹50 once, full advance copy, 0–2 free delivery at inclusive
₹499 during normal hours, and rain +₹29 retained. Schema, pricing engine,
banner, FAQ, late blog post, calculator, shared form, checkout, Dough logic,
customer messages, and documentation were updated. Calculator passes chosen
distance/time/rain/etc. to checkout via sessionStorage. Both pages use the
same quote engine. The checkout quote row uses exactly “Delivery (...)” and
“Late-night kitchen reopen surge (prepaid).” Added pricing matrix test and
updated Dough test. The old `beyond 4 km` saved customer choice maps to
`beyond6` so it does not silently become the new 4–6 km band; the first radio
now reads “0–2 km.”

Worker: distance boundaries changed to inclusive lower slab (`<= km_to`),
owner correction supports 4–6 and beyond 6, fee corrections preserve prior
rain/kitchen charges, late-night full advance enforced at `handleAccept`,
admin UI asks owner for the exact amount received, docs updated, delivery and
payment unit test added. Windows `check-admin-script.mjs` spawn of local
Wrangler was repaired. `src/delivery-distance.ts` `free_above` is optional
for outer slabs. Current backend test uses Node 24
`node:module.stripTypeScriptTypes` and passes with an experimental warning.

### Exact changed-file inventory at pause

Website modified: `AGENTS.md`, `MEMORY.md`, `PRD.md`, `README.md`,
`docs/DOUGH-RULES.md`, `package.json`, `site.config.json`,
`skills/update-delivery-charges.md`, `src/components/OrderOptions.astro`,
`src/components/OrderQuote.astro`, `src/lib/data.ts`, `src/lib/dough.ts`,
`src/lib/order-form.ts`, `src/lib/pricing.ts`,
`src/pages/blog/late-night-food.astro`, `src/pages/checkout.astro`,
`src/pages/faq.astro`, `src/pages/index.astro`,
`src/pages/price-calculator.astro`, `src/schemas/site-config.ts`,
`test/dough-rules.test.mjs`. Website new/untracked: this `CONTINUE.md`,
`docs/DELIVERY_PRICING.md`, `test/delivery-pricing.test.mjs`.

Worker modified: `AGENTS.md`, `docs/DOUGH_AND_REFERRALS.md`,
`docs/LAUNCH_MESSAGES.md`, `docs/WIRING.md`, `package.json`,
`scripts/check-admin-script.mjs`, `src/admin.ts`, `src/campaign.ts`,
`src/customers-tab.ts`, `src/delivery-distance.ts`. Worker new/untracked:
`src/late-night-payment.ts`, `test/delivery-policy.test.mjs`.

Notes on scope: `menu.json` was not edited. Menu item ₹99 or ₹399 marketing,
referral, or product prices are unrelated to the removed delivery minimums.
Historical PRD/PROGRESS records were left as history, with current-policy
pointers still needing completion in the progress files.

## Tests already run

- Site `npm run build`: passed after the latest edits on 2026-09-28, 0 errors,
  0 warnings, 12 hints, 20 pages built. Hints include unused declarations and
  existing Astro inline-script/Zod deprecation suggestions; they do not fail
  the build. Rerun after further edits.
- Site `npm run test:delivery`: passed after the latest edits, including
  distance boundaries, cart values, free delivery, former afternoon window,
  late night, and rain matrix.
- Site `npm run test:dough`: 32 passed, 0 failed after the latest edits.
- Site `npm run test:gallery`: 38 passed, 0 failed after the latest edits.
- Worker `npm run verify`: passed after the latest edits; `tsc --noEmit`,
  rendered admin script parser (one script, 411360 bytes), and delivery/payment
  test all passed. The test prints Node's experimental-warning for type
  stripping. Rerun after further edits.
- Worker `node test/delivery-policy.test.mjs`: passed after the latest edits.
- `git diff --check`: no whitespace errors in both repositories (line-ending
  warnings only), run before the final handoff edits. Rerun before commit.
- Browser earlier showed Food ₹129 + Delivery (4–6 km) ₹119 + one ₹50 late
  kitchen surge = ₹298. Calculator/checkout handoff was verified once for
  ₹129 + ₹119 = ₹248. This was before the final build; recheck final output.

Build/verification commands were invoked through the installed Node and npm
CLI because the Windows `npm` shim sometimes points to a missing global
`npm-cli.js`:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run build
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run test:delivery
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run test:dough
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run test:gallery
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run verify
```

Run the first four in the website repository and `run verify` in the Worker
repository. `npm ci` was already run for the Worker. No npm lockfile change
was recorded. The Worker install reported three upstream audit findings; no
dependency update was attempted for this pricing change.

## Remaining work in priority order

1. **Fix Worker customer-facing bill messages.** `src/admin.ts`
   `billMessage()` around line 2575 labels the combined `delivery_fee`
   (which may include kitchen and rain) just “Delivery.”
   `revisedBillMessage()` around line 3098 does likewise and always says
   “You can still pay on delivery,” which is false for late-night orders.
   Keep payment and surcharge communication accurate. Worker admin stores
   surcharges within `delivery_fee`; the original `quote_text` holds the
   frontend line breakdown. Review correction flow too: changing distance
   after an already accepted prepaid late order can increase total, requiring
   additional payment before final confirmation.
2. Finish numeric/semantic audit of current customer-facing sources. Historical
   PRD/PROGRESS/archive records have old numbers; add clear current-policy
   supersession notes rather than rewriting history. `src/lib/data.ts` and
   `src/campaign.ts` stale comments were corrected just before pause.
3. Update site `PROGRESS.md`, Worker `PROGRESS.md`, and site
   `docs/CART_AND_CHECKOUT.md` with a short current-policy pointer.
   `docs/DELIVERY_PRICING.md` currently says “More than 2–4 km” / “More than
   4–6 km” in its table; clarify the intervals.
4. Inspect `src/lib/order-form.ts` late preorder/rain copy after rebuilding.
   Previously it suggested paying online locks the price for rain even though
   late-night rain must be included. A patch was made before the last build.
5. After fixing open issues, rerun site `npm run build`,
   `npm run test:delivery`, `npm run test:dough`, `npm run test:gallery`,
   and `skills/qa-check.md` / `skills/verify-site.md` checks. Rerun Worker
   `npm run verify` and
   `node node_modules/wrangler/bin/wrangler.js deploy --dry-run` (no deploy).
6. Browser UAT on the built local site: home/banner, menu Add button, cart,
   calculator, checkout, handoff, late-night 0–2 example (ideally ₹618→₹707),
   4–6, beyond 6, free delivery, rain, payment notice, mobile/desktop.
   Keep the preview available and hand off its browser tab to the owner.
7. Review diffs, `git diff --check`, status. Commit the exact files and push
   the feature branches if QA passes. No merge, deploy, production config
   change, or live verification until owner approves the local preview.
8. Give the requested nine-part implementation report, including every changed
   file, exact commands/results, UAT status, branch/commit/working tree, and
   known limitation that full payment is manually verified by the owner; no
   online gateway exists.

### Resume checklist

- [ ] Fix `billMessage()` and `revisedBillMessage()` labels/payment copy for
      late-night and rain orders; exercise normal and late examples.
- [ ] Decide and implement the required payment handling if a previously
      accepted, prepaid late-night order's distance correction increases total.
- [ ] Review all relevant live copy and generated WhatsApp/order messages for
      old numbers, minimums, afternoon promotion, and 4 km boundary.
- [ ] Finish PROGRESS and checkout documentation pointers, clarify current
      policy table wording, and audit generated `dist/` for stale delivery copy.
- [ ] Complete site QA checklist and Worker dry-run.
- [ ] Browser UAT the actual cart → calculator → checkout → message flow,
      including 0/2/4/6 km boundaries, low baskets, ₹499 free threshold,
      late night, rain, 4–6 km, and beyond 6 km.
- [ ] Verify the exact customer requested ₹618 + ₹39 + ₹50 = ₹707 checkout
      breakdown and full advance wording.
- [ ] Review both diffs, run final checks, make feature commits, push feature
      branches, and record Git state.
- [ ] Show the owner the local site and wait for explicit approval. Only after
      that approval may the documented merge, UAT, and production workflow run.

Potential policy nuance: existing normal prepaid orders waive *later* rain
charges; currently active rain is included, including late night. The current
policy document explains this. Existing free delivery threshold is inclusive
₹499, first band only, and disabled late night. Preserve these documented
prior conditions.

Memory was consulted in this run. If final answer uses that memory, append
the required `<oai-mem-citation>` block at the very end per developer memory
instructions; relevant `MEMORY.md` lines about the site are near 24–27.
