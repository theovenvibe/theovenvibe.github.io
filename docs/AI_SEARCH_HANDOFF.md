# The Oven Vibe AI-search handoff — 17 October 2026

## Status

Owner approved both the core preview and the two festival guides for publication. PRs 146–149 are merged to develop at 5bed461. This file records the implementation; verify the actual main Pages workflow and the workspace checkpoint for current production status. Owner explicitly excluded Umami and WhatsApp. Analytics, original photos, menu/config, delivery/payment logic and backend are unchanged.

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
- git diff verifies menu.json, site.config.json, original images and quote/order logic are unchanged from the original main. Layout changes only canonical construction. site.js changes only menu hash revelation; its Umami handlers remain untouched.
- Desktop preview reviewed and clean screenshot saved. At 390px, all nine table wrappers had equal client/scroll width 333px and no horizontal document overflow. Native FAQ rendering/read-only DOM inspected. Some browser click/deep-link interactions timed out through the automation connection; do not present every interactive FAQ/menu link as manually verified. Static fragment checks passed. Temporary viewport reset to default.
- Existing production baseline: public audit passed all 15 current sitemap pages at 2026-10-17 08:16 UTC (later receipt saved separately). Existing pages appeared in a focused public search, with some older delivery details in cached results. This does not prove current Google index totals or ChatGPT/Claude/Gemini citations.
- No customer order, enquiry, platform message, push notification or payment was submitted.
- Festival extension adds /blog/diwali-party-menu/ and /blog/durga-puja-food/, with homepage/blog links and existing first-party photography. Diwali date is attributed to the IIRS government calendar. Proposed total: 19 indexable pages, eight articles and 41 menu entries. Integrated build/search/cart/delivery checks passed; gallery remains 38/38. Browser confirmed dish category revelation and FAQ answer opening via hashes.
- Search Console accessed in the correct theovenvibe@gmail.com account and sc-domain:theovenvibe.com property: verified owner, generative-AI Include already enabled, robots valid. Overview baseline: 49 total web-search clicks, 14 indexed and six not-indexed pages. These precede this deployment and are delayed report figures; no improvement is attributed to this work.
- IndexNow helper was run only in preview mode. No notification has been sent for this release yet.

## Review and release next

The required owner preview approvals are complete, including festival copy. Do not ask again for the same approved scope. Check actual production evidence before claiming deployment.

1. Keep PRs stacked: foundation -> develop, content -> foundation, monitoring -> content. Review/merge bottom-up and retarget the next PR to develop when its predecessor lands. Use merge commits; preserve develop.
2. After feature merges, build and run test:search on develop, verify required QA, then open the develop -> main release PR. Do not accidentally include unrelated changes.
3. Wait for the actual main deploy workflow, including Lighthouse/Pages jobs. The historical legacy Jekyll failure does not prove the Astro deployment failed; never add root .nojekyll. Inspect actual run/job evidence.
4. Run node scripts/audit-live-search.mjs without --baseline after release. Check new guide/standards/FAQ, menu anchors and source parity in the live site.
5. Run node scripts/notify-indexnow.mjs --submit ONCE after content and ownership file are live; retain HTTP receipt, distinguish acceptance from indexing. Dispatch the read-only search-health workflow once on main to verify it.
6. Continue Search Console/Bing sitemap and citation checks in the correct Oven Vibe account/property. Google ownership/AI inclusion and overview baseline were verified as above; sitemap/security/manual-action/Bing statuses require their own evidence. No account creation or security changes are implied.
7. Update this handoff/PROGRESS with exact PRs, commits, successful workflow/deployment URLs, audit receipts and any remaining failures. Report here only.

## Files and recovery

### Festival retirement checkpoint (17 October 2026)

Owner requested three reusable cleanup skills, not immediate removal. They are `skills/remove-durga-puja-promotion/SKILL.md`, `skills/remove-navaratri-special/SKILL.md` and `skills/remove-diwali-promotion/SKILL.md`, with shared GitHub/QA steps in `skills/festival-retirement-release.md`. Routing is in AGENTS.md; outstanding actions are in TODO.md and SEARCH_TODO.md. Current festival promotions and menu remain unchanged by this documentation work.

Navaratri already expires at 21 October 2026, 06:00 IST, with browser guards, a build-time filter and scheduled rebuild. Its scheduled workflow's one-time guard ends 22 October 00:00 UTC; verify actual published JSON/HTML/schema, not just a green skipped workflow. Durga Puja and Diwali homepage links have no automatic expiry. Run their skills after the relevant campaign ends. Diwali's current guide is for 8 November; a multi-day campaign closing time is not yet specified. Preserve canonical article URLs as clearly ended guides, regular dishes, first-party photos and Umami. No new scheduler or social posting is configured.

Canonical site: https://theovenvibe.com/. Site/menu/guide data sources and boundaries are in AGENTS.md, AI_SEARCH.md, SEO_PLAYBOOK.md and SEARCH_TODO.md.
Screenshots and baseline receipt are outside public source at D:/Workbench/The Oven Vibe/outputs/2026-10-17-ai-search. Preview is http://127.0.0.1:4331/choose/ (server session 29335 at checkpoint; may require restart). No permanent background monitoring is promised.

Organic Google Business/Instagram captions and proposed windows are prepared in that output folder's FESTIVAL_PROMOTION.md. User selected preparation for these channels and website/search. No social post or paid ad has been sent, and automatic publication is not configured. Review the actual account, content, photo and schedule before external publication.

After release, rollback through normal revert PRs in reverse order rather than resetting/force-pushing main. No backend resources need rollback. Do not rewrite the source catalogue or resubmit unchanged URLs to search engines as a recovery action.
