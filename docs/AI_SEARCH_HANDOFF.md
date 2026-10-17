# The Oven Vibe AI-search handoff — 17 October 2026

## Status

Review draft, NOT DEPLOYED. Production main remains unchanged. Owner requested the same SEO/AEO/GEO/LLMO foundations as Bhuk Lagla, explicitly excluding Umami and WhatsApp. This release does not change analytics, original photos, menu/config, delivery/payment logic or the backend.

Owner confirmed directly on 17 October: all Oven Vibe images are their own photographs, not AI-generated. This supersedes any assumption imported from another brand. No fictional founder story, customers, interviews, statistics or reviews were added.

## Scope and branch stack

- feature/ai-search-foundation: stable code-based menu entities and real HTML anchors, connected WebPage/organization context, one trailing-slash canonical convention, honest sitemap dates and crawler rules. Foundation commit d38128e.
- feature/ai-search-content (based on foundation): existing FAQ expanded to 26 anchored native answers; /choose/ covers 35 available dishes/drinks and six combos (including seven seasonal dishes until the existing campaign expires); /content-standards/ documents first-party photography, source/correction policy and AI editing assistance. Six existing articles updated honestly; original publication dates retained. Source commit b0c8d9b.
- feature/ai-search-monitoring (based on content): CI search gate, monthly/manual live health workflow, public IndexNow ownership/helper and current operating docs.

Local develop was fast-forwarded to main's existing release merge 8ecf750: no additional content was introduced by that sync. The gh-stack extension/instruction location mentioned by the repo is absent on this machine; preserve the required stack semantics using ordinary Git branches/PR bases rather than installing or modifying global tooling.

## Verification actually completed

- npm run build passed, zero errors/warnings (nine existing hints remain).
- npm run test:search passed: 17 proposed indexable pages, 41 menu entities; metadata/canonicals/sitemap exclusions/JSON-LD, prices and IDs against the published catalogue, guide coverage, actual fragment targets, visible FAQ/schema equality, visible article dates, original brand/ratings/pure-veg/emoji rules.
- Existing cart handoff and delivery pricing matrix passed.
- Existing menu mappings/batch checks passed. Gallery: 38 passed, zero failed.
- git diff verifies menu.json, site.config.json, original images, public/scripts/site.js and quote/order logic are unchanged from main. Layout changes only canonical construction; Umami remains untouched.
- Desktop preview reviewed and clean screenshot saved. At 390px, all nine table wrappers had equal client/scroll width 333px and no horizontal document overflow. Native FAQ rendering/read-only DOM inspected. Some browser click/deep-link interactions timed out through the automation connection; do not present every interactive FAQ/menu link as manually verified. Static fragment checks passed. Temporary viewport reset to default.
- Existing production baseline: public audit passed all 15 current sitemap pages at 2026-10-17 08:16 UTC (later receipt saved separately). Existing pages appeared in a focused public search, with some older delivery details in cached results. This does not prove current Google index totals or ChatGPT/Claude/Gemini citations.
- No customer order, enquiry, platform message, push notification or payment was submitted.
- IndexNow helper was run only in preview mode. No notification has been sent for this release yet.

## Review and release next

The current repo's skills/release-manager.md requires visible copy/UI review before merging to develop. Present the concrete preview and PR stack; obtain owner approval, then proceed without re-asking for the same approved scope.

1. Keep PRs stacked: foundation -> develop, content -> foundation, monitoring -> content. Review/merge bottom-up and retarget the next PR to develop when its predecessor lands. Use merge commits; preserve develop.
2. After feature merges, build and run test:search on develop, verify required QA, then open the develop -> main release PR. Do not accidentally include unrelated changes.
3. Wait for the actual main deploy workflow, including Lighthouse/Pages jobs. The historical legacy Jekyll failure does not prove the Astro deployment failed; never add root .nojekyll. Inspect actual run/job evidence.
4. Run node scripts/audit-live-search.mjs without --baseline after release. Check new guide/standards/FAQ, menu anchors and source parity in the live site.
5. Run node scripts/notify-indexnow.mjs --submit ONCE after content and ownership file are live; retain HTTP receipt, distinguish acceptance from indexing. Dispatch the read-only search-health workflow once on main to verify it.
6. Inspect Search Console/Bing in the correct Oven Vibe account/property. Record actual ownership, sitemap processing, AI inclusion and citation baselines; these account states have not been inspected during this draft. No account creation or security changes are implied.
7. Update this handoff/PROGRESS with exact PRs, commits, successful workflow/deployment URLs, audit receipts and any remaining failures. Report here only.

## Files and recovery

Canonical site: https://theovenvibe.com/. Site/menu/guide data sources and boundaries are in AGENTS.md, AI_SEARCH.md, SEO_PLAYBOOK.md and SEARCH_TODO.md.
Screenshots and baseline receipt are outside public source at D:/Workbench/The Oven Vibe/outputs/2026-10-17-ai-search. Preview is http://127.0.0.1:4331/choose/ (server session 29335 at checkpoint; may require restart). No permanent background monitoring is promised.

After release, rollback through normal revert PRs in reverse order rather than resetting/force-pushing main. No backend resources need rollback. Do not rewrite the source catalogue or resubmit unchanged URLs to search engines as a recovery action.
