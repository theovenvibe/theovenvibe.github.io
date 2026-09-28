# Delivery pricing v2 — implementation and release report

## Documentation reviewed

Website: AGENTS.md, CLAUDE.md, MEMORY.md, README.md, bootstrap-session.md,
PRD.md, PROGRESS.md, skills/update-delivery-charges.md, manage-offers.md,
qa-check.md, verify-site.md, release-manager.md, release-recovery.md,
deploy-cicd.md, stacked-prs.md, update-combo.md, update-description.md,
remove-or-disable-item.md, docs/CART_AND_CHECKOUT.md, DOUGH-RULES.md,
PICKUP_DISCOUNT.md and DELIVERY_PRICING.md.

Worker: AGENTS.md, README.md, HANDOFF.md, PRD/PROGRESS relevant sections,
docs/README.md, WIRING.md, DOUGH_AND_REFERRALS.md, LAUNCH_MESSAGES.md,
skills/deploy.md and stacked-prs.md. Marketing: CLAUDE.md, AGENT.md,
MEMORY.md, README.md, brand/README.md and .claude/skills/menu-card/SKILL.md.

## Architecture and source of truth

- `site.config.json` defines slabs, free thresholds, kitchen and rain charges.
- `src/lib/pricing.ts` computes quotes. Calculator and checkout share
  `order-form.ts`, OrderOptions and OrderQuote. Cart stores stable catalogue IDs.
- Distance is a customer-selected band or exact km; no new routing/geofence
  service was introduced. Exactly 2, 4 and 6 km use the lower band.
- Worker stores the frontend quote and fetches the published site's slabs for
  owner corrections. Corrections change only the base distance component.
- No payment gateway exists. Kitchen sends its QR; owner verifies receipt.
  The Worker rejects late-night acceptance without the exact full total received.

## Approved policy and changes

| Distance | Standard delivery | Normal-hours free from, inclusive |
|---|---:|---:|
| 0–2 km | ₹39 | ₹499 |
| More than 2 through 4 km | ₹79 | ₹899 |
| More than 4 through 6 km | ₹119 | ₹1299 |

All distance and late-night minimums removed. Weekday afternoon promotion and
minimum removed. Late-night ₹59/₹99 rates removed: standard delivery applies,
plus one ₹50 kitchen reopen surge, with full final advance payment enforced
before acceptance. Missing and partial receipts fail. Accepted late bills that
increase require receipt of the revised full amount.

Rain remains +₹29 once when active; pickup excludes rain. Existing regular
customer rain waiver remains. Free delivery zeros only delivery and remains
excluded late night. The old combined-charge cap was removed because it would
reduce the explicitly requested late + rain charges. Dough still earns 5%,
redemption is capped at 10% of eligible food and balance, and item exclusions
remain. Its obsolete minimum-order headroom was removed.

Banner, calculator, checkout, FAQ, policy and WhatsApp bills align. The owner
requested removing the beyond-6-km sentence from the hero only; out-of-area
validation and marketplace guidance remain elsewhere. Late checkout uses
“Delivery” and a single “Late-night kitchen reopen surge (prepaid)” line.

Owner menu edits: Firecracker Fizz Combo ₹309, Corn Crunch Fizz Combo ₹279,
Farmhouse Fizz Combo ₹289; Cheesy Garlic Bread Toast unavailable; all six
sandwich descriptions identify jumbo bread or regular sandwich bread.
Catalogue IDs and included combo products remain stable.

## QA results

| Scenario | Result |
|---|---|
| 0, 1, 1.999, 2, 2.001, 3, 3.999, 4, 4.001, 5, 5.999, 6, 6.001 km | Pass |
| Low carts ₹99/100/129/199/248/249/250/398/399/400 | Pass; no minimum gate |
| ₹498/499/500, ₹898/899/900, ₹1298/1299/1300 | Pass; inclusive band thresholds |
| Normal, former afternoon, 23:29, 23:30, 02:00, 02:01 | Pass |
| Late + rain, all bands and free thresholds | Pass; standard +50 +29 |
| Active rain cannot be unchecked to evade charge | Pass |
| Free delivery affects only delivery; excluded late | Pass |
| Missing/partial/full late payment acceptance | Pass, actual handlers with D1 stand-in |
| Accepted late bill increase and undo | Pass; full revised receipt required |
| Rendered admin script and emitted bill/time helpers | Pass |
| Calculator → cart → checkout handoff | Pass; exact basket replaces old items/extras |
| ₹618 food +₹39 delivery +₹50 late surge =₹707 | Pass in local calculator/checkout |
| Mobile 390×844 checkout, homepage, Add and quantity controls | Pass in local browser |
| Built HTML/JSON-LD, emoji, rating, descriptions, image alt and routes | Pass |
| Dough actual frontend helper, 120,000 randomized checks | Pass, 32 assertions |

## Commands and verification

Website: `npm run build` (0 errors/warnings, 6 existing hints, 20 pages),
`npm run test:delivery`, `npm run test:cart`, `npm run test:dough` (32/0),
`npm run test:gallery` (38/0),
`python scripts/check-delivery-policy.py --url http://127.0.0.1:4321`
(29 HTML files, 19 JSON-LD blocks, 10 intentional redirects, 27 routes),
and `git diff --check`.

Worker: `npm run verify` (tsc, rendered admin parse, emitted helper regression,
delivery/payment tests) and
`node node_modules/wrangler/bin/wrangler.js deploy --dry-run`.
Windows uses the installed Node/npm CLI directly when the npm shim is broken.
No dedicated lint or existing E2E runner is configured; Astro check/tsc and
browser UAT provide the documented gates.

## UAT and approval

Owner inspected the local website and requested the final copy/menu edits.
Explicit release approval followed on 2026-09-28 after the final sandwich edit.
No real customer test order, payment, push alert or WhatsApp message was sent.
Live deployment evidence and commits are recorded in the release record appended
after deployment; never infer a successful deploy from an older Actions run.

## Remaining limitations

Manual QR receipt is verified by the owner; no online payment gateway or bank
reconciliation was introduced. The backend still trusts captured frontend
quotes rather than independently recomputing the entire order. Time-window
constants remain mirrored in its payment helper and tested against site policy.
Archived documentation and dated marketing campaigns preserve their historical
figures with current-policy pointers. The reusable print generator was repaired,
but existing PDFs/social cards must be regenerated and visually reviewed before
distribution; no marketing artwork or message was published.

## Git and file inventory

Feature branches use `feature/delivery-pricing-v2`; website menu edits ship as a
separate stacked layer. Website release flows through develop to a main release
PR; Worker through develop to main, followed by one Wrangler batch deployment.
The inventory below includes every implementation file; local screenshots in
`.tmp/` are evidence only and are excluded from commits.

### theovenvibe.github.io

- `AGENTS.md`: Documentation, policy, workflow or handoff.
- `CONTINUE.md`: Documentation, policy, workflow or handoff.
- `MEMORY.md`: Documentation, policy, workflow or handoff.
- `PRD.md`: Documentation, policy, workflow or handoff.
- `PROGRESS.md`: Documentation, policy, workflow or handoff.
- `README.md`: Documentation, policy, workflow or handoff.
- `docs/CART_AND_CHECKOUT.md`: Documentation, policy, workflow or handoff.
- `docs/DELIVERY_PRICING.md`: Documentation, policy, workflow or handoff.
- `docs/DELIVERY_PRICING_V2_REPORT.md`: Documentation, policy, workflow or handoff.
- `docs/DOUGH-RULES.md`: Documentation, policy, workflow or handoff.
- `docs/PICKUP_DISCOUNT.md`: Documentation, policy, workflow or handoff.
- `menu.json`: Business data and owner-approved menu copy.
- `package.json`: Shared pricing, cart, order UI or backend enforcement.
- `scripts/check-delivery-policy.py`: Automated verification.
- `site.config.json`: Business data and owner-approved menu copy.
- `skills/update-delivery-charges.md`: Documentation, policy, workflow or handoff.
- `src/components/OrderOptions.astro`: Shared pricing, cart, order UI or backend enforcement.
- `src/components/OrderQuote.astro`: Shared pricing, cart, order UI or backend enforcement.
- `src/lib/cart.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/lib/data.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/lib/dough.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/lib/order-form.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/lib/pricing.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/pages/blog/late-night-food.astro`: Shared pricing, cart, order UI or backend enforcement.
- `src/pages/checkout.astro`: Shared pricing, cart, order UI or backend enforcement.
- `src/pages/faq.astro`: Shared pricing, cart, order UI or backend enforcement.
- `src/pages/index.astro`: Shared pricing, cart, order UI or backend enforcement.
- `src/pages/price-calculator.astro`: Shared pricing, cart, order UI or backend enforcement.
- `src/schemas/site-config.ts`: Shared pricing, cart, order UI or backend enforcement.
- `test/cart-handoff.test.mjs`: Automated verification.
- `test/delivery-pricing.test.mjs`: Automated verification.
- `test/dough-rules.test.mjs`: Automated verification.

### the-oven-vibe-backend

- `AGENTS.md`: Documentation, policy, workflow or handoff.
- `PROGRESS.md`: Documentation, policy, workflow or handoff.
- `docs/DOUGH_AND_REFERRALS.md`: Documentation, policy, workflow or handoff.
- `docs/LAUNCH_MESSAGES.md`: Documentation, policy, workflow or handoff.
- `docs/WIRING.md`: Documentation, policy, workflow or handoff.
- `package.json`: Shared pricing, cart, order UI or backend enforcement.
- `scripts/check-admin-script.mjs`: Automated verification.
- `src/admin.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/bill-charges.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/campaign.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/customers-tab.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/delivery-distance.ts`: Shared pricing, cart, order UI or backend enforcement.
- `src/late-night-payment.ts`: Shared pricing, cart, order UI or backend enforcement.
- `test/delivery-policy.test.mjs`: Automated verification.

### the-oven-vibe-marketing

- `AGENT.md`: Documentation, policy, workflow or handoff.
- `CLAUDE.md`: Documentation, policy, workflow or handoff.
- `MEMORY.md`: Documentation, policy, workflow or handoff.
- `README.md`: Documentation, policy, workflow or handoff.
- `brand/build_print_menu.py`: Shared pricing, cart, order UI or backend enforcement.
