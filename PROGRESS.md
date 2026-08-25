# PROGRESS

## Status: 🚀 **v3.0.0 LIVE** (2026-07-30). All phases complete. theovenvibe.github.io serves the v2 rebuild. Day-to-day ops: bootstrap-session.md + skills/. Remaining items are owner actions (see final session log).

## 2026-08-25 — Dough offer rules, five local offers, five bugs

**Shipped (PRs #86–#89, all live).**

Dough can no longer be **spent** on an item running an offer, or on a drink. It
is still **earned** on everything except drinks — deliberate: ₹3,335 of Dough has
been credited and ₹183 ever spent, so the promise costs about 33 paise in
practice and it is the only thing that brings a customer back. Mixed baskets
split correctly — three offer items at ₹300 plus one full-price item at ₹200
releases ₹20, not ₹50.

**Five local offers live to 15 Sept**, labelled "Chef Special": Herb Paneer ₹149,
Creamy Alfredo ₹149, Crunchy Capsicum ₹139, Red Sauce Pasta ₹129, Korean Maggi
₹119. Chosen on one rule — **not selling AND good margin**. All five had sold
zero units and carry 61–68% margin. Discounting a proven seller is a gift, not a
lever. **Review 8 Sept and stop the offer on whichever one has become a best
seller.**

**Five bugs, all recorded with root causes in `docs/DOUGH-RULES.md`.** The owner
found three of them:

- **A** Dough stacked on offers — a rule written in a doc with no code and no test is not a rule
- **B** "You need a bigger basket" on a ₹586 order — a variable's meaning changed but its name did not
- **C** Offers invisible — SQLite `datetime()` vs ISO; `' '` sorts before `'T'`
- **D** Chased a phantom ₹0 — a failing INSERT was silenced with `/dev/null`
- **E** The price calculator hid every offer — I verified the path I built and never asked what else shows a price

**Guardrails added.** `npm run test:dough` — 37 assertions plus 120,000
randomised baskets on five invariants, including *never drags an order under its
minimum*, which is the exact shape of bug B. One shared `DOUGH_OFFER_RULE` string
across checkout, the Dough page, the FAQ and the calculator. New skill
`skills/manage-offers.md`.

**Learned the hard way:** anything depending on the Worker **cannot be tested on
localhost** — CORS allows only the production origin and the failure is silent.

**Left open.** The Dough earn on drinks is unverified (needs `ADMIN_TOKEN`, not
requested). Grow Max charges an unknown percentage of net sales; every price
reserves 8% for it. `CLAUDE.md`'s branching line is stale — `develop` is 111
commits behind and the freeze ended at v3.0.0 on 30 July.

##
## Design lock history: owner rejected all 3 mockup directions (2026-07-30) → v2 = v1 pixel-for-pixel (Phase 3, verified). The lock has since been **amended twice, both times by the owner**: Phase 3.5 (approved visual polish, now live) and Phase 4 (approved copy/CTA/pure-veg/local-page changes). Parity is the floor, not the ceiling; any *further* visible change still needs the owner's sign-off first.

## Phase checklist (from PRD §11)

- [x] **Phase 0 — Asset & data prep** (owner + chat) — DONE 2026-07-29
  - Menu audit: 32 items / 7 categories / 5 combos / 6 add-ons — **0 issues** (all have category, AVIF+WebP image, valid price/status; combo refs valid)
  - Hero dish: **Paneer Makhni Royale Pizza** (752649876, ₹199, image verified)
  - GBP: claimed & verified, **4.9★ / 16 reviews**, entity `/g/11zj4x092l` (link resolves ✓)
  - Delivery slabs: ₹29 (0–2 km) / ₹59 (2–4 km) / ₹99 (4–8 km), FREE > ₹599 — recorded in PRD §3, to be seeded into site.config.json in Phase 1
- [x] **Phase 1 — Architecture** (Fable 5, high effort) — DONE 2026-07-29
  - Astro 7.1.6 + Tailwind 4 + TS strict + sitemap; Zod schemas for menu.json + site.config.json (seeded with real §3 values); data layer src/lib/data.ts; 7 route stubs (menu renders real data end-to-end); 9 v1-URL stubs (blog slugs binding, see AGENTS.md); 91 JXL purged; static/→public/static/ (URLs preserved); CI build-all-branches / deploy-main-only; AGENTS.md + 12 skill skeletons + Portfolio design skills copied
  - Fresh-eyes QA gate: **10/10 PASS** (incl. negative test: corrupt config → readable Zod error → restore green)
  - Exit criteria met: build green on develop ✅ (post-merge), CI check ✅, old URLs stubbed ✅
- [x] **Phase 2a — Design research** (Sonnet 5 + web search, medium) — DONE 2026-07-29 (brief committed + owner reacted)
  - **Owner decisions (binding for 2b):** build BOTH directions as proposed — "Ember Editorial" (dark, primary) + warmed "Fresh Counter" (cream light); logo concepts to draw as SVG: **Ember Arch** + **Flame Mark + wordmark** (Stamp/Seal rejected)
  - Exit: inspiration brief `design/RESEARCH.md` committed (site patterns + **logo/brand research** + photo analysis); Milan has reacted to it
  - ⚠️ **Open:** "Milan has reacted" exit criterion is NOT yet satisfied — brief is written and committed, but owner has not yet reviewed/reacted. Do not treat 2a as fully closed until Milan responds; surface the brief to him before starting 2b.
- [x] **Phase 2b — Design system** — CLOSED 2026-07-30 with owner decision: **no new design.**
  - Built 3 directions (Ember Editorial, Fresh Counter, v1-Faithful) + 2 logo concepts — ALL REJECTED by owner
  - **Binding outcome (PRD §8 superseded block):** v2 design = v1 design pixel-for-pixel; style.css IS the design system; logo unchanged (brand-refresh scope cancelled); WA cart-builder PARKED pending owner approval post-parity; only invisible changes allowed
  - Mockups/logos kept in design/ for history only
- [x] **Phase 3 — Pixel-parity migration** (Sonnet 5, standard — rescoped) — DONE 2026-07-30
  - Ported v1's `style.css` verbatim into `src/styles/global.css`; Tailwind import removed (plugin stays registered in astro.config.mjs, unused, per instructions). Fonts unchanged from v1 (v1 names "Inter" in the stack but never loads it — no Google Fonts link anywhere in v1 — so both sides render on the system-ui fallback; nothing to self-host).
  - Rebuilt as Astro components emitting v1's exact DOM: `Nav.astro` (sticky nav + mobile overlay, incl. v1's own inconsistencies: "active" class only ever appears on the Contact link and only on the Contact page; mobile overlay has 6 links on home vs 4 elsewhere), `Footer.astro` (v1 injected this via script.js after DOMContentLoaded — now build-time, same markup), `WhatsAppFab.astro`, `AccordionItem.astro` + `MenuCard.astro` + `MenuAccordions.astro` + `AddonsAccordion.astro` (replace v1's `fetch('menu.json')` + client-built DOM with build-time rendering from `src/lib/data.ts` — same final markup, no more empty-section pop-in). `public/scripts/site.js` ports v1's `script.js` interactions (scroll-reveal, mobile menu, nav-link anchor+accordion-open handling, accordion toggle) minus the fetch/build/setTimeout machinery that's no longer needed.
  - Rebuilt pages 1:1 from `main`: `/` (hero, menu/combos/add-ons, why, party CTA, latest stories), `/contact/`, `/faq/` (+ page-local close-others accordion script), `/sundargarh/`, `/blog/` index, and the 5 posts at the AGENTS.md-bound slugs (`/blog/cloud-kitchen-future/`, `/blog/veg-vs-non-veg/`, `/blog/pizza-under-300/`, `/blog/affordable-pizza/`, `/blog/late-night-food/`) via a shared `BlogPostLayout.astro`.
  - SEO: per-page OG/Twitter/canonical + JSON-LD ported from v1's `<head>`, **except** the home page's fabricated `aggregateRating` (4.9/**120**) and 3 fake "Local Customer" reviews (PRD §3 binding ban) — replaced with a real `aggregateRating` from `site.config.json` (4.9/**16**) and no `review` array. FAQPage and BlogPosting JSON-LD carried over as-is (real content, not fabricated). GTM, Google Ads gtag, and Yandex Metrika (incl. webvisor session recording) were **not** ported — PRD §5 names Umami as the analytics solution and Phase 3's brief only requires porting SEO tags, not ad-tech trackers; flagged below as an owner question. `failover.js` dropped (its own source says "disabled — not in use").
  - Two out-of-v1-scope stub routes (`/menu/`, `/404`) had no v1 source to port but broke visually once Tailwind was removed, so they were restyled with the same v1 design system/components instead of shipping unstyled.
  - **Parity verification:** built the site, extracted `main` into a scratch dir (git show → files, symlinked `public/static` as its `static/`), served both via `python -m http.server`, screenshotted both with Playwright/Chromium (fonts.googleapis.com/gstatic requests aborted both sides — moot here since v1 never loads a webfont anyway; `.animate-on-scroll` forced visible; lazy images forced eager + awaited) at 390/768/1440px.

    | Page | 390px | 768px | 1440px |
    |---|---|---|---|
    | Home (`/`) | identical | identical | identical |
    | Contact (`/contact/`) | identical | identical | identical |
    | FAQ (`/faq/`) | identical | identical | identical |
    | Blog index (`/blog/`) | identical | identical | identical |
    | Blog post (`/blog/cloud-kitchen-future/`) | identical | identical | identical |
    | Sundargarh (`/sundargarh/`) | identical | identical | identical |
    | *(bonus, beyond the required set)* | | | |
    | `/blog/affordable-pizza/` | identical | — | identical |
    | `/blog/late-night-food/` | identical | — | identical |
    | `/blog/pizza-under-300/` | identical | — | identical |
    | `/blog/veg-vs-non-veg/` | **allowed diff** (+319px) | — | **allowed diff** (+225px) |

    "Identical" = full-page screenshot heights matched to the pixel *and* visual inspection found no difference (colours, spacing, wrapping, images). Two real bugs surfaced and were fixed during this pass — both were an Astro-compiler quirk, not a copy mistake: Astro trims a whitespace-only text node that spans a line break between inline elements down to *nothing* (not a collapsed single space, unlike a browser parsing raw HTML), which had silently deleted a rendered space in three spots: "on WhatsApp" on the FAQ page, "remains: **Veg Pizza...**" on the veg-vs-non-veg post, and the gap between the WhatsApp/Zomato/Swiggy buttons on `/sundargarh/` (that div has no flex/gap CSS, so it was relying on the text-node space). All three now keep the relevant tag on the same source line as its preceding word so the space survives. Separately, v1's `blog-pizza-under-300.html` has a genuine authoring bug — `<div class="hero-container">` opened twice back-to-back — which doubles that element's padding and reflows its hero text narrower; reproduced faithfully via a `doubleWrapHeroContainer` prop on `BlogPostLayout` rather than "fixed", since Phase 3 is pixel-parity, not cleanup.
  - **The one allowed/expected diff:** `blog-veg-vs-non-veg.html` is missing `<script src="script.js">` in `main` (its very last line has the closing `</body>` right after the footer placeholder div, no script tag) — a real, live v1 bug. Its knock-on effects: the footer never renders, the mobile-menu JS never binds, and `.animate-on-scroll` content (hero badge/heading/subtitle) never becomes visible since the IntersectionObserver that adds `.is-visible` never runs on that one page. Reproducing that literally means shipping one post that's permanently half-blank — reads as an accidental content bug, not a design decision — so this page gets the same shared Layout/footer/scripts as its four siblings. This is the source of the two "allowed diff" rows above (v2 taller only because the footer now renders).
  - Build green (`astro check && astro build`, 0 errors/warnings). Merged `feature/phase-3-migration` → `develop` (`--no-ff`), rebuilt on merged `develop`, pushed.
- [x] **Phase 3.5 — Visual polish (G1 living cards + G2 brand micro-motion)** — CLOSED 2026-07-30, **owner-approved live**
  - Implemented as the additive `src/styles/polish.css` + `public/scripts/polish.js` layer (pointer:fine only, rAF-throttled, all effects off under `prefers-reduced-motion`). Deleting the polish.css import restores exact v1 parity.
  - G3 glass + G4 orbit cursor remain REJECTED. This phase also established the precedent that **approved visible enhancements are allowed** on top of the v1-parity floor — which is what Phase 4's copy scope builds on.
- [x] **Phase 4 — Content, copy & SEO** (Opus 5, medium) — DONE 2026-07-30
  - **Owner-approved visible scope** (amends the pixel lock again): site-wide de-emoji + premium copy pass, CTA rewrite, "100% Pure Veg" trust marker, real `/sundargarh/` landing page.
  - **Render-time menu copy cleaning (`src/lib/data.ts`)** — `menu.json` stays byte-for-byte untouched (Zomato mirror, PRD §6). `displayName()` strips emoji (👨‍🍳/🌶️) and `[bracket]` catalogue markers; `displayMeta()` returns the information those markers actually carried as a muted line under the item name (`Regular · 7 inches`, `25 g`, `Spicy`, `Extra spicy`); `displayDescription()` drops `[Veg preparation]` from all 32 items — the site says pure veg **once, prominently**, not 32 times. Accordion subtitles pluralised ("1 items" → "1 item").
  - **One SEO component (PRD §9)** — `src/lib/seo.ts` (all schema.org graphs + `LINKS` for the off-site profiles) + `src/components/Seo.astro` (canonical, OG incl. `og:locale en_IN` and explicit image dimensions/alt, Twitter, one `ld+json` `@graph`), rendered from new `<Layout>` props (`ogTitle`/`ogType`/`image`/`jsonLd`). A new route now gets full SEO markup for free instead of hand-copied `<head>` blocks. `SITE_URL` still lives only in astro.config.mjs (read via `import.meta.env.SITE`).
  - **Structured data:** `Restaurant`+`LocalBusiness` (geo, `openingHoursSpecification` for all 7 days, `areaServed` 8 km GeoCircle, `servesCuisine` incl. `Vegetarian`, telephone, address, `hasMap`, `potentialAction` OrderAction, `sameAs` → Instagram/GBP/Zomato/Swiggy) + full `Menu`/`MenuSection`/`MenuItem` from menu.json (**8 sections, 37 items**, each with price + `suitableForDiet: VegetarianDiet`) + `FAQPage` + `BlogPosting` ×5 (dates kept from the v1 posts, none invented) + `BreadcrumbList` on inner pages + `Blog`/`WebSite`/`Organization`. `priceRange` / `lowPrice` / `highPrice` / `offerCount` are **computed from menu.json** — v1 hard-coded ₹69–349; the real current range is **₹89–₹319**.
  - **Fabricated-rating ban re-verified:** the only rating in the build is site.config.json's real 4.9/16; the verification script fails the run on any other `ratingValue`/`reviewCount` or on any `review` object.
  - **Honesty/consistency fixes found while writing copy** (all were live on v1):
    1. `/faq/` had **three different opening times** — visible copy "11:30 AM to 12:30 PM", JSON-LD "2:00 PM to 11:00 PM", config 11:00–21:00 — and its FAQPage markup listed 6 questions that did not match the 5 visible ones (invalid markup; Google requires a match). One `faqs` array now drives both, sourced from the config.
    2. `blog/veg-vs-non-veg` ran a "Non-Veg Pizza Craze" section recommending meat toppings and closed with "whether you are team Veg or team Non-Veg, The Oven Vibe has something special for everyone" — from a 100% pure veg kitchen, on the exact query where pure veg is the differentiator. Rewritten to answer the same intent honestly.
    3. `blog/late-night-food` promised "late-night availability" and "fresh food, even at night" while the kitchen closes at 21:00. Retargeted truthfully ("order before 9 PM").
    4. `blog/affordable-pizza` recommended non-veg dishes at a competitor; that listing was dropped (remaining listings keep the locations/price bands the owner published in v1 — nothing invented).
    5. `/contact/` was a bare Google Form with **no phone number, no WhatsApp link and no hours** — the one page people open when they want to reach the business. Now has call/WhatsApp buttons and a NAP/hours/delivery block.
    6. Footer carried a dead `href="#"` Facebook link (now the GBP link) and a hard-coded "© 2025" (now computed).
    7. The nine v1 URL stubs carried `noindex` alongside a cross-page canonical — a contradictory signal that tells Google to drop the old URL rather than fold its history forward. `noindex` removed.
  - **`/sundargarh/` rebuilt** from three buttons + one sentence into a real local page: H1 on "Food delivery in Sundargarh 770001", delivery-slab explanation, category highlights with live "from ₹x" prices, four quick answers, closing call CTA. Every fact from site.config.json/menu.json — no invented landmarks.
  - **`site.config.json` gains `business.address.street`** (the address v1 published, `Bijaya Talkies Road, In front of Subasini Clinic`) so the NAP has one owner-editable source. ⚠️ **Owner must confirm it matches the Google Business Profile word-for-word** — flagged in the playbook as the first citation task.
  - **`docs/SEO_PLAYBOOK.md`** — Part A: what the site now does. Part B: the honest gap audit, ranked (GBP categories/photos/posts/Q&A, review velocity, review responses, Instagram bio + geotagged reels, local citations + NAP, WhatsApp Business catalogue, the github.io ceiling and when to buy the domain, Search Console + sitemap + **re-crawl request now that the fabricated-rating markup is gone**, realistic month-by-month timeline).
  - **Verification:** `npm run build` green (0 errors, 0 warnings, 4 pre-existing Zod deprecation hints). Custom script over `dist/`: **21 HTML files, 12 JSON-LD blocks, 0 parse failures**; every page has a unique title ≤60 and description ≤155, canonical, og:title/description/image/locale/type, and a non-empty `alt` on every `<img>`; **zero emoji** in rendered HTML (© excluded as typographic); zero "Chicken"/"[veg"/"[Regular" leftovers; zero Astro whitespace-trim join artifacts (five were found and fixed). Sitemap lists all 11 routes. Playwright at 1440 + 390 across home/menu/sundargarh/faq/contact/blog: all 200, **no horizontal scroll**, no console errors (the 16 on /contact/ are the third-party Google Form iframe).
  - Exit criteria met: fabricated reviews verifiably gone ✅ · zero placeholder text ✅ · valid Restaurant/Menu/FAQ/BlogPosting/Breadcrumb markup ✅ (Rich Results Test itself is an owner/online step — listed in the playbook). Lighthouse SEO to be measured in Phase 5/6 with the CI budgets.
  - **Post-Phase-4 addendum — Fable SEO audit fixes, merged `5f6b85f`** (`feature/` branch, commit `7f78fc8` + merge `5f6b85f`, same day): a follow-up audit caught three things the phase itself missed — favicon was still Astro's scaffold rocket icon (replaced with logo-derived `favicon.png` + `apple-touch-icon.png`), `og:image` was WebP, which is unreliable in WhatsApp/Twitter link previews (regenerated as 1200×630 JPEGs — `og-default.jpg` for the home/hero default + one per blog post, via `sips`, now living in `public/static/images/og/`), and there was no `theme-color` meta tag (now the brand red, `#e63946`). Also: review count removed from *visible* hero copy per owner request while staying in JSON-LD (Google requires it there). This landed on `develop` before Phase 5 started; Phase 5 built on top of it (the OG jpgs are exactly what `skills/update-item-photo.md` §6 documents how to regenerate).
- [x] **Phase 5 — Ops & docs** (Sonnet 5 + Haiku 4.5, low) — DONE 2026-07-30
  - **All 15 skill files now full versions** (12 Phase-1 skeletons replaced + 3 new: `qa-check.md`, `deploy-cicd.md`, `setup-analytics.md`). Every file: one task, exact paths, a before/after diff example, a literal verify command, a `skills/troubleshoot-build.md` pointer, and the GitHub-web-editor-on-a-phone flow (PRD §6).
  - **CI workflow renamed** `.github/workflows/ci.yml` → `deploy.yml` (owner requirement; `name:` updated to `deploy`). The one stale reference (`AGENTS.md`) fixed; repo-wide grep for `ci.yml` now only matches the two lines of AGENTS.md prose that describe the rename itself.
  - **Umami wired, off by default:** `site.config.json` gains `analytics.umami_website_id` (Zod-validated, empty string = disabled), `src/layouts/Layout.astro` emits the Umami `<script>` tag only when non-empty, `public/scripts/site.js` fires `call_click`/`wa_click` on `tel:`/`wa.me` link clicks guarded by `window.umami` (no-op until an ID is set). Verified byte-for-byte: with the current empty ID, `grep -rl "cloud.umami.is" dist/**/*.html` returns nothing — build output is unchanged from before this feature landed. New `skills/setup-analytics.md` gives Milan the 5-step cloud.umami.is signup → paste-ID flow.
  - **Repo cleanup:** deleted `design/mockups/*` (3 rejected mockup directions) and `design/logos/*` (2 rejected logo concepts) — dead weight since Phase 2b's "v2 = v1 pixel-for-pixel" pivot; git history preserves them. Moved `design/RESEARCH.md` + `design/DESIGN.md` (real photo-audit/pattern facts, still useful context) to `docs/archive/`; removed the now-empty `design/` dir. Deleted `public/static/images/menu zomato/` — a leftover raw Zomato export (Python script + per-category AVIF dump) superseded by the `product_images`/`combo_images`/`add_on_images` layout the site actually uses; grepped first, zero references anywhere. No `.jxl` files and no tracked `.DS_Store` existed to remove (both already clean).
  - **README.md rewritten** for the v2 repo (was still the old emoji-heavy v1 draft): what it is, structure map, quickstart, content-editing model (menu.json/site.config.json/skills), branch model, deploy model, links out to PRD/PROGRESS/AGENTS/SEO_PLAYBOOK.
  - **AGENTS.md finalized** (PRD §10): repo map brought current (`docs/archive/`, `deploy.yml`, `public/static/images/og/`, `.claude/skills/` note, and the correction that blog posts are individual `.astro` files, NOT an Astro content collection — the repo never adopted that PRD §5 assumption in Phase 3); full skills table; a qwen-operator instruction ("start every task by opening the matching `skills/*.md` file") added right under the title so a small model reads it before anything else; golden rule 10 added for the analytics off-by-default contract.
  - **prompt.md** now launches only the remaining Phase 6 (previously a generic "next unchecked phase" launcher).
  - **Lighthouse CI budgets** (PRD §11 Phase 5 deliverable + §10.2 Gate 3 — initially missed in this session, added after a fresh-eyes review caught the gap): `.lighthouserc.json` (repo root) + a `treosh/lighthouse-ci-action` step in `.github/workflows/deploy.yml`'s `build` job, running on every branch (no `npm` dependency added). Thresholds are deliberately BELOW PRD §1's final ≥95 launch target — they're regression budgets measured against Phase 5's real scores (performance 1.0, accessibility 0.94–0.96, SEO 1.0 on every page tested; best-practices 1.0 except `/contact/` at 0.77 because of the third-party Google Form iframe, a known accepted issue kept at `warn` so it doesn't block merges). Performance/accessibility/SEO are `error`-level (fail the build on a real regression); best-practices is `warn`-level. Verified locally against the real `dist/` build via `npx @lhci/cli autorun` — all assertions pass, nothing broken. Phase 6's device/perf-tuning pass should tighten these thresholds toward the real §1 target once measured on real throttled mobile conditions. Documented in `skills/deploy-cicd.md` §8.
  - **Two Phase-4 carry-over suggestions explicitly deferred, not silently dropped:** the previous session's "Next" note suggested (a) folding `docs/SEO_PLAYBOOK.md` Part B into a short owner-facing checklist, and (b) moving the Zomato/Swiggy/Maps URLs from `src/lib/seo.ts` → `LINKS` into `site.config.json` (they're business values; AGENTS.md golden rule #2 says those belong in the config). Neither was in this phase's actual brief (skill files, CI rename, Umami, cleanup, docs), and both are non-trivial enough to deserve their own pass rather than a rushed add-on here. Left for Phase 6 or a dedicated `feature/*` branch — flagging here so they don't quietly vanish from the record.
  - **Owner mid-Phase-5 update, applied:**
    1. `skills/release-manager.md` §7: Milan's "ship it" for the v3.0.0 launch recorded as already satisfied (2026-07-30) — explicitly flagged as one-time, so Phase 6 doesn't need to re-ask, and Phase 6's copy of `prompt.md` updated to match.
    2. `skills/release-manager.md` new §8.1 "test-then-merge": the standing post-launch policy — `skills/qa-check.md` must pass on a feature branch before `merge --no-ff` into develop, and on `develop` before any `develop → main` release PR. This is what replaces "ask Milan every time" once the launch's one-time approval is spent; the existing owner-approval gate for visible/UI changes (§3) is unchanged, this adds an objective gate on top.
    3. `skills/release-recovery.md` gained a new §G "git: which command for which situation" — merge-vs-rebase rule, step-by-step conflict resolution, `git bisect`, `git cherry-pick`, revert-vs-reset rule, a consolidated stash recipe (§E1 now points here instead of duplicating it), `git reflog`, `git restore`, and a one-screen symptom→tool→section table (§G9).
  - **Launch tag decision:** `v3.0.0` (owner decision) — a major version, even though the project is still called "v2" throughout this doc and PRD.md. The project name and the tag number are intentionally different; `skills/release-manager.md` §7 has the explanatory note so nobody "fixes" it back to `v2.0.0` later.
  - **Verification:**
    - `npm run build` green on the feature branch throughout, and again after the merge to develop (0 errors).
    - Umami-absent byte check: `grep -rl "cloud.umami.is" dist/**/*.html` → no hits with the current empty `umami_website_id`.
    - Repo-wide `grep -rn "ci.yml"` (excluding `.git`/`node_modules`/`dist`/`.astro`) → zero hits outside the two AGENTS.md lines that describe the Phase 5 rename itself.
    - Skill-file path checker (a Python script walking every backtick-quoted path in `skills/*.md`, `AGENTS.md`, `README.md`): every real repo path referenced by a skill file exists; the only "missing" hits are pre-existing historical mentions inside `PRD.md`/`PROGRESS.md`'s own session log (component names in prose, and `design/RESEARCH.md`'s old location, referenced from *before* this phase moved it) — not skill-file defects, left untouched since PRD.md is binding text and PROGRESS.md's log is a historical record, neither meant to be rewritten after the fact.
    - `skills/qa-check.md`'s own JSON-LD parse loop, emoji grep, and honesty checks (rating tuple, non-veg words) all run clean against `dist/`: 12/12 JSON-LD blocks parse, 0 emoji hits, exactly one rating tuple site-wide (`4.9`/`16`, matching `site.config.json`), zero non-veg words.
    - **Local-LLM acceptance test (PRD §10/§11 Phase 5 exit criterion), run for real:** in an isolated git worktree at this phase's final commit, followed `skills/update-price.md` literally — as if reading only it + `AGENTS.md`, nothing else — to change Veg Fried Rice's price 179 → 199. The field was exactly where the skill said it would be; `npm run build` passed green; the new price appeared correctly in `dist/menu/index.html`. Negative-path check: introduced a malformed price (`"199"`, quoted) and the build failed with the EXACT error text `skills/update-price.md`/`troubleshoot-build.md` document: `menu.json → Menu_Items.0.price: price must be a number (no quotes, no ₹ symbol)`. Both paths pass — the PRD §10 acceptance test is satisfied. (Note: an automated background subagent was also launched for this test but its worktree isolation rooted from a stale, pre-Astro commit with no skills/ or AGENTS.md present — a tooling issue, not a content issue — so the test above was re-run directly and is the one this entry certifies.)
  - **PRD §10.2 Gate 1 fresh-eyes review, run for real (independent subagent, no shared context):** confirmed all of the above independently (own `npm run build`, own read of every file) and caught three real gaps this session had missed, all fixed before merge: (1) Lighthouse CI budgets were entirely absent despite being an explicit PRD §11 Phase 5 deliverable — added, see above; (2) `skills/update-price.md`'s sample error text was imprecise (quoted the `.int()` message for what would actually trigger the `.number()` message) — corrected to show all three real Zod messages for that field; (3) three skill files (`setup-analytics.md`, `release-manager.md`, `release-recovery.md`) lacked a `skills/troubleshoot-build.md` pointer — added. It also flagged PRD.md §11's Phase 6 row still saying tag `v2.0.0` — fixed with a small inline annotation (PRD keeps its "supersedes" convention rather than being silently rewritten). This is exactly the gate PRD §10.2 requires; the phase is being marked done only after acting on its findings, not just receiving them.
  - Exit: local-LLM acceptance test passes ✅ (see above); fresh-eyes gate findings acted on ✅.
- [ ] **Phase 6 — QA & launch** (Sonnet 5, low-standard)
  - Exit: PRD §1 metrics met per page; redirects verified in prod; GBP checklist handed to owner

## Session log

### 2026-08-19 (Dough & Referrals: the customer side)

- **Dough is live.** Balance read at checkout, spent under a 10% cap, and the
  quote the kitchen receives shows `Dough applied −₹40` so the page and the
  WhatsApp message cannot disagree. The Worker recomputes the cap from the
  stored basket, so a tampered page cannot spend more — a forged request asking
  ₹999 against a ₹60 balance took ₹40.
- **`/dough` and `/refer`**, the coin icon, a balance bubble above the basket
  FAB, a homepage card, and both pages in the nav on every page. The pages say
  nothing about food cost, margin or redemption assumptions — a customer needs
  four facts, and the rest is our business.
- **The pickup discount is retired**, commented not deleted. On a 0–2 km
  delivery we collect ₹29 and burn ~₹11 of petrol, so delivering is **₹18
  better for us** than the same order collected; below ₹499 we were paying ₹30
  for the privilege of losing ₹18. `docs/PICKUP_DISCOUNT.md` has the maths and
  the three files to edit to switch it back on.
- **Beverages** added with the owner's own bottle photos, add-ons now attach to
  a dish (KOT-style), and live offers show in the Combos & Offers section.
- **Three bugs worth remembering**, all found by driving the built site rather
  than reading it: keying the white out of a bottle photo also erased the clear
  plastic neck; the Thums Up source carried transparency that flattened onto
  black; and the Dough promo buttons carried `row-tight`, an **admin** class
  that does not exist here, so they overlapped on a phone. A class name that
  silently does nothing is worse than no class.
- **SEO:** `/offer/` was `noindex` and still in the sitemap — the same
  contradictory signal Phase 4 removed from the v1 stubs, reintroduced by a
  later page. Now filtered alongside `/checkout/`.


### 2026-08-18 (Platform buttons moved to where they help: out-of-range checkout)

- **The owner's idea, and the sharper half of the same principle.** Beyond
  `maxDeliveryKm` the quote cannot be sent — `pricing.ts` returns
  `kind: 'beyond'`, and both **Copy quote** and **Send order on WhatsApp** go
  inert. That was a dead end at the exact moment someone was ready to order.
- **Order on Zomato / Order on Swiggy now take their place there** (PR #52).
  Same buttons, opposite meaning: on the homepage the customer was already ours
  and the buttons gave them away; out of range they were never ours to lose,
  because we cannot cook for that address.
- `#beyondActions` in `OrderQuote.astro`, hidden by default, shared by
  `/checkout/` and `/price-calculator/`; toggled by `showBeyondActions()` in
  `order-form.ts`. It **replaces** the send pair — two greyed buttons beside two
  live ones is a puzzle, not a choice.
- **The bug that was designed out:** every path that disables or re-enables the
  send buttons also clears the platform pair, including the ones that never
  reach `renderOutput`. Without that, emptying the basket after an out-of-range
  quote left "Order on Zomato" sitting under "Add items above to see your
  total".
- Verified at 390px with a real basket: hidden initially, shown on **More than
  4 km**, hidden again on **Under 2 km**, live on the deployed site.

### 2026-08-18 (Zomato and Swiggy hero CTAs retired)

- **The homepage was sending its own customers to a competitor's checkout.** The
  kitchen's partner-click alert fired twice in eleven minutes: visitors arriving
  on our site and tapping the hero's **Order on Zomato** / **Order on Swiggy**
  buttons — the same food, minus the commission, at a slower ticket, and a
  customer the platform then owns.
- **Both buttons removed from the hero** (PR #51). `See the Menu` deliberately
  stays `btn-secondary`: the hero already has one red primary just above it
  (*Check your exact total & Order Now*), and two stacked reds compete instead
  of leading.
- **Commented in place, not deleted** — the owner's call, so it is one
  uncomment to put them back. `LINKS`, `.btn-zomato`/`.btn-swiggy` and
  `PartnerClickAlerts` are all untouched.
- **`docs/PLATFORM_LINKS.md` is new**: the decision, the exact markup, the
  restore steps, and the mentions that stayed on purpose — the beyond-radius
  line (a customer we genuinely cannot serve), the footer links, the sundargarh
  page, and the `sameAs` structured data, which is SEO and never rendered.
- Verified live: no `btn-zomato` or `btn-swiggy` in the deployed homepage, hero
  down to one button. The `pages-build-deployment` check fails as it has since
  #50; the real `deploy` workflow is green and the change is live.
- **Watch next:** `stock_moves.channel` in the admin's Stock tab is now the
  honest measure of whether this moved anything.

### 2026-08-18 (App feel: the mobile menu, and the /offer page)

- **The customer site had the same class of bug as the Kitchen Console**, which
  was the owner's own insight: we converted a website into an app twice, so both
  inherit the same problems. Audited, and one confirmed.
- **The full-screen mobile menu was pure CSS state**, so the hardware back
  button skipped past it and left the page — in the installed app, left the app.
  It now takes a history entry while open: back closes it and stays put, tapping
  X consumes the entry, and nav links consume it on the way out (otherwise the
  next page starts with a stale entry and the first back press does nothing).
- The overlay also gained `overflow-y: auto` with overscroll containment. It
  fits at seven links and would stop fitting at eight, and that failure is
  silent — anything past the fold is simply unreachable. That is exactly how the
  Console's sheet ended up hiding its own heading.
- **Audited and deliberately not changed:** the ordering funnel (real page
  navigation, so browser back already walks it correctly — that IS right for a
  funnel, unlike the Console's tabs), the soft-ask and install banners
  (non-modal, with their own dismiss buttons), and the extras drawer on checkout
  (a native `<details>`, which behaves as people expect).
- **`/offer` shipped** — the ad and push landing page. Only what is discounted
  right now, with the deadline on each card and no exits. Every card is rendered
  at build time and hidden, then revealed by `/availability`: the site is static
  and offers are set minutes before a push, but building cards in JavaScript
  would mean a second card implementation drifting from `MenuCard`, and nothing
  at all for a visitor whose script fails. `noindex`, since its content changes
  daily. The empty state is most days, so it always offers the menu.
- **Back-in-stock and the closed-kitchen banner shipped** (see the backend's
  PROGRESS for the full story). Both carry a soft-ask for notification
  permission, because someone who wants a sold-out pizza or found the kitchen
  closed is the highest-intent visitor this site ever gets.
- **VAPID public key rotated.** The old pair had been exposed in a chat
  transcript; done while the only subscriber was the owner's test device.

### 2026-08-17 (Offer pricing — the customer half of P0-B)

- **What it does:** the Worker's `/availability` now carries live offers beside sold-out state, so "Pizza @₹99 tonight" is a real price rather than something only a push message claims. Same one call this page already made.
- **Menu cards** show the normal price struck through beside the offer price, with the owner's label under it. Replacing ₹129 with ₹99 outright would leave a customer no way to see that ₹99 is the point — and the Worker refuses to store an offer that is not lower, so the strike-through can never lie about the direction.
- **Checkout** writes the offer price into the catalogue row and keeps the normal price beside it, rather than threading a second "which price?" argument through the line amounts, the subtotal, the WhatsApp quote and the order payload. That is exactly how one of those ends up quietly charging the wrong number.
- **The quote carries both figures** — `Zesty Onion Feast Pizza x2 — ₹198 (offer ₹99 each, normally ₹129)` — so the owner sees what was promised when they confirm.
- **`sold_out` is deliberately ignored at checkout.** Removing a line from a basket the customer already built, on the page they came to in order to send it, is a bigger decision than this phase should make alone. The backend's P0-E puts it in front of the owner at confirm time, where a human is already looking.
- **A bug this found in itself, invisible to the build.** The "an offer ended while you were ordering" notice first rendered only what the *latest* poll had raised. It showed for one minute, and the next tick — which raised nothing, the price having already changed — erased it, leaving the customer with a total ₹30 higher than the one they read and no explanation on screen. Caught by watching two poll cycles rather than one; a single cycle looks perfect. The messages now accumulate for the life of the page, since there is no moment at which "that offer has ended" stops being true. Second time in one session that putting a single-pass painter on a timer broke it.
- **Verified in a browser against the built `dist/`**, with a local stand-in for `/availability`: card showed `₹129` struck / `₹99` / "Tonight only" with `aria-label` "₹99, down from ₹129", a no-offer card untouched at ₹159; checkout charged ₹198 for two and totalled Food ₹357; the quote carried both prices; ending the offer mid-session reverted the line to ₹129 each / ₹258 and Food ₹417, showed the notice, and the notice survived the following tick; the quote dropped its offer claim. Add still works — 2 → 3 on the line, 3 → 4 on the badge.
- **Checked and cleared:** `elementFromPoint` reports the Add button covered by `.accordion-item` while its section is collapsed. Identical on the deployed live site, so it is the accordion clipping its own content, not a regression from the new price markup.

### 2026-08-17 (Sold-out state went stale on an already-open page)

- **Owner report:** "I marked all the pizza out of stock, but a customer who had the site open before that still sees it in stock and can order it."
- **Root cause:** `CartScript.astro` fetched the Worker's `/availability` exactly once, at page load, in an IIFE. Sold-out is a live fact about the kitchen; the page never asked again. A tab left open on the menu was frozen at whatever was true when it loaded.
- **Fix:** re-check every 60s, and again on `visibilitychange` and on a bfcache restore. A phone in a pocket runs no timers, and someone coming back to the tab is exactly the person about to tap Add. The Worker caches `/availability` for 20s, so a minute here costs it very little.
- **A second defect underneath, exposed by making it repeat.** `markLateNightItems()` and `applySoldOut()` each wrote `textContent`. That worked only because each ran once and sold-out ran last — on a timer, whichever fired most recently wins, so a sold-out item could quietly become "Add" again at the top of the minute. They are now one `paintButtons()` pass, sold-out taking precedence over pre-order (an item the kitchen has run out of cannot be pre-ordered either).
- **And a third:** `applySoldOut` never undid itself. It set `textContent = 'Sold out'` inside `if (off)` with no else, so an item the owner put back on the menu kept the label until a full reload — polling alone would not have fixed the owner's other complaint. `paintButtons()` captures the label Astro rendered in `data-base-label` on first pass and restores it, clearing `disabled` and the `aria-label` with it.
- The "Added" flash now repaints instead of restoring the label captured at click time — the item may have sold out during those 1200ms, and putting "Add" back invites a second tap on something the kitchen no longer has.
- Fails open throughout: any error leaves `soldOut` as it was, which means everything stays orderable (backend AGENTS.md rule 5).
- **Verified in a browser against the built `dist/`**, not just `npm run build`. A local stand-in served `/availability`, since the real Worker allows one fixed origin. Sold-out rendered disabled with the note "Sold out — back at 10pm." for a `back_at` of 16:30 UTC (correct IST); flipping it back on restored "Add", cleared `disabled`, removed the note and the `aria-label`, with no reload; flipping it off again applied live, again with no reload. Clicked Add on an available item: count incremented and `ovenvibe.cart.v2` gained the quantity. After deploy, the Midnight Pizza Box combo — switched off by the owner in the admin app — rendered sold out on the live menu.
- **Left open:** an item already in a basket when it sells out still goes through checkout. Removing it silently would be worse; this belongs with the backend's P0-E, which shows the owner the discrepancy at confirm time.
- Paired with `the-oven-vibe-backend`, which cut the `/availability` cache from 60s to 20s and added combos and add-ons to the admin toggle list. No website change was needed for combos and add-ons: their cart ids already carry the `combo-`/`addon-` prefix this file strips, and all three shapes render through `MenuCard`.

### 2026-08-15 (Hotfix — the disabled send button was untappable)

- **Owner report:** on `/checkout/` with an 8-digit mobile, the field error appeared but tapping the greyed-out "Send order on WhatsApp" did not scroll to the field or focus it.
- **Root cause:** `.calc-actions [aria-disabled='true']` in `src/styles/order-form.css` carried `pointer-events: none`. The tap never reached the link, so the click handler — the thing that names the invalid field, scrolls to it and focuses it — never ran. The error the owner saw came from the field's own `blur`, which is why it looked like only the scrolling was broken. The rule predates this work (it came across with the calculator's CSS) and became wrong the moment a blocked tap was given something to say.
- **I had already seen this and dismissed it.** Playwright reported `<div class="calc-actions"> intercepts pointer events` during the cart/checkout work and I wrote it off as a scroll-animation artifact, then said so in the docs. It was the bug. Measuring `document.elementFromPoint` over the button at rest — instead of trusting the explanation — showed the wrapper on top, and the pointer-events rule underneath it.
- **Fix:** drop `pointer-events: none`, keep the greyed look, add `cursor: not-allowed`. The tap can do no harm: `disableActions()` strips the href, and `beforeSend` re-validates before anything is sent.
- Verified with the owner's exact reproduction: scroll moves 1960 → 466, the field is on screen, focused, error shown. All six suites green, calculator regression 0 diffs. A regression guard now asserts the disabled button keeps `pointer-events: auto` and that a tap at its centre lands on the link.
- **`skills/release-manager.md` gained §8.2**, the post-launch hotfix flow. §9 already said a hotfix was "just a normal `hotfix/*` branch off main, released per §8", but §8 never mentioned back-merging `main` into `develop` — and without it the next release silently reverts the fix.

### 2026-08-15 (Cart, checkout, and one order form instead of two)

- **Owner unparked the WA cart-builder** (PRD §8 / Phase 2b parked it pending approval post-parity). Built on `feature/cart-and-checkout`: an **Add** button on every menu card, a basket in the nav **and** a floating basket (owner asked for both — "some people can miss the nav button"), and a new `/checkout/` page that prices the basket by the same rules as the calculator and sends it on WhatsApp. Design and rationale: `docs/CART_AND_CHECKOUT.md`. New `TODO.md` is now the queue of decided-but-undone work.
- **The load-bearing decision: the order form is implemented once.** ~500 lines of controller moved out of `price-calculator.astro` into `src/lib/order-form.ts`, with its markup in `components/OrderOptions.astro` + `OrderQuote.astro` and the orderable catalogue in `data.ts` (`orderCatalog`). A page now supplies only a `BasketRow[]`. Copying the late-night/rain/pre-order rules into a second page would have drifted silently — each page would still look right on its own. AGENTS.md gains golden rules 12 and 13.
- **The calculator was proved unchanged rather than assumed to be.** A 15-scenario behavioural baseline was captured from the built page BEFORE the refactor (standard, quiet hours on a weekday and a Saturday, below minimum, free delivery, each distance band, exact km, pickup above and below the ₹299 floor, rain, prepaid-waives-rain, closed, late-night pre-order, standard pre-order), recording quote text, total, rendered output, time-rule note, availability note, button states and the visibility of every conditional control. After the refactor: **0 field differences** — and again after the catalogue move, and again after the add-ons work. Screenshots before/after the CSS move differ by 0.04% of pixels at 390px, all of it a 1px vertical shift of one text line.
- **Add-ons attach to a basket line** (owner caught this: "if they added extra cheese just like that then how we could know in which pizza"). Each line carries its own extras with their own quantities, nested under the dish in the message. One line per distinct item, so "cheese on one of the two" is the extra's quantity. Removing a dish removes its extras. Cart storage moved to `ovenvibe.cart.v2`.
- **`/checkout/` collects a name and mobile** (owner request, for later offers) with an **unticked** opt-in, validated to exactly ten digits starting 6–9 (accepting `+91`, a leading `0`, and spaces) after the owner asked for a length check. The total stays visible while the buttons are shut — hiding the price to extract a phone number would be a dark pattern.
- **A real leak, caught by its own test:** the ntfy alert published the whole quote, which had just grown the customer's name and phone number — onto a topic that is world-readable on free ntfy. `order-form.ts` now builds the message and the alert text separately, and the suite asserts neither the name nor the number ever appears in the alert body.
- **Two pre-existing bugs fixed on the way**, both live on the site before this: `runsMon–Fri` (a missing space — the Astro whitespace-trim trap documented in the Phase 3 entry), and the distance radio ignoring a typed distance (entering 3.2 left "Under 2 km" selected while the quote priced the 2–4 km slab). Owner spotted the second one. Both fixed in the shared component, so both pages got the fix.
- **The nav's "Order Now" button was removed** (owner asked, and confirmed which of the two before anything was touched). It pointed at a bare `wa.me` link: a button labelled *Order Now* opened an empty WhatsApp chat with no item and no quote, leaving the customer to type the order from memory — the exact problem this site exists to solve. The basket took its place as the nav CTA (red button, cart icon, "Order", count badge). The home page's "Check your exact total & Order Now →" was kept: it goes to the calculator and does what it says.
- **Zomato and Swiggy clicks now ring the kitchen too**, at **high** priority rather than the order alert's **urgent** — a customer messaging you directly needs you now; a maybe-order on a partner tablet is worth a glance. Matched on the link's hostname, not a CSS class, so every placement is covered (home buttons, footer, `/sundargarh/`) including ones added later. This is also the first visibility the business has into how much traffic the site sends to the partners. Publishing moved to `src/lib/notify.ts`, shared with the order form so escaping and failure behaviour cannot drift.
- **`/checkout/` was excluded from the sitemap.** It is `noindex` (one customer's basket, empty for everyone else), and noindex-plus-sitemap is the contradictory signal Phase 4 removed from the v1 stubs.
- **Late owner changes, all after the first round of review:** the calculator now hands its basket to `/checkout/` instead of sending an order itself (it had no name or callback number, so an order from there could not be followed up), and that handoff fires its own **low**-priority "Building an order" alert — pair it with the order alert that may follow, and silence after one is the clearest abandonment signal the site can produce. The nav's "Order Now" went; the basket is the CTA. Zomato/Swiggy clicks alert at **high**. Validation was rebuilt as two independent gates after the owner found that `aaaaaaaaaa` was accepted — a real bug I introduced by removing the old gate before wiring the new one. And, reversing the earlier decision, **the customer's name and mobile now go into the ntfy alert as well as the message** (owner's call, made after being told plainly that a free ntfy topic has no access control and every number is therefore published to a channel strangers can subscribe to; `alertIncludesCustomer` defaults to off and only `/checkout/` opts in, and the Cloudflare Worker mitigation is written up in the doc).
- **Three layout bugs the owner caught and I fixed at the root:** basket rows were flex with `space-between`, so every row placed its controls wherever its own text ended — they are now one shared three-column grid, verified by measuring that every stepper starts on one x and every price ends on one x at 390 and 1280. A duplicate `.cart-extra` rule further down the file was overriding that grid with `display:flex` and a `padding-left` that shifted extras 1.25rem out of line — my own mistake, and exactly why the first fix looked like it had not worked. And menu-card Add buttons sat at different heights because descriptions differ in length; the card is now a full-height column with the price/Add foot pushed to the bottom, verified across rows with description lengths of 101 vs 5.
- Verification: `npm run build` green; `skills/qa-check.md` steps 1–5 pass; **48 cart, 21 add-on, 17 nav/partner-alert, 40 validation and 12 alignment assertions** pass; calculator regression 0 diffs on every re-run. The validation suite covers every value the owner listed (`aaaaaaaaaa`, 5/9/10/11/12/14 digits, letters mixed with digits, whitespace only, a wrong leading digit) plus two bypass attempts that force the disabled button and the disabled copy button — neither sends anything.
- **Open:** owner review of the visible changes, then merge. `TODO.md` carries the deliberately-deferred items — chiefly customer push notifications, which the owner has asked to design together before any code is written.

### 2026-08-15 (Order alerts — the kitchen finally hears an order)

- **Problem the owner brought:** `/price-calculator/` hands the customer a quote and opens WhatsApp with it, but nobody on the kitchen side watches WhatsApp continuously, so order messages sit unread. Needed something free that rings a laptop and three phones.
- **Built on `feature/ntfy-order-alerts`** (off `origin/develop`): `notifications.ntfy_topic` in `site.config.json` (Zod-validated, empty string = feature fully off, same off-by-default contract as the Umami ID), and a `notifyKitchen()` in `src/pages/price-calculator.astro` that POSTs the quote to `https://ntfy.sh/<topic>` at `Priority: urgent` from **both** the WhatsApp link and the Copy-quote button. Plan and rationale: `docs/ORDER_ALERTS_PLAN.md`. Owner setup: `skills/setup-order-alerts.md` (second owner-facing skill after `setup-analytics.md`). AGENTS.md gains golden rule 11.
- **Why ntfy and not Telegram/Discord:** the site is a static public build, so the alert is sent from the customer's browser by code anyone can read. ntfy accepts a plain POST with **no token at all**; a bot token or webhook URL in page source would be a giveaway. That decided it.
- **The plan's original security model was wrong and had to be replaced.** It assumed an ntfy *reserved* topic set to "everyone can publish, only I can read" — that is a **paid** feature. Free ntfy has no access control; its own docs say the topic name *is* the password. Rather than pay or bolt a Cloudflare Worker (free, hides the topic, but inserts a second service that can fail silently between the customer and the kitchen), the topic is a 22-character `secrets`-generated random string and the exposure is accepted **because the alert body carries no customer PII** — items, prices, slot, nothing else. Two rules are now binding (AGENTS.md golden rule 11, MEMORY.md): the name stays long and random, and no name/phone/address may ever be added to the alert body. The live risk is spam, not privacy; rotation is one config line plus re-subscribing four devices, and that is the trigger to revisit the Worker.
- **Three implementation details that would each have looked like a flaky bug:** `keepalive: true` on the fetch (the tab hands off to WhatsApp and cancels a normal request exactly when it matters most); an ASCII-only `Title` header (ntfy sends headers as latin-1 — `₹` and the en-dash in slab labels break the request; the body stays UTF-8); and a dedupe guard so a double-tap does not ring four devices twice. The fetch fails silently by design — a dead alert must never block an order.
- **Stated limits, not hidden ones:** the alert is order *intent* (fires on the click; the customer can still abandon) and it is not an order log — free-tier ntfy expires a message about 12 hours after it is sent, confirmed on the live response (`time` → `expires`).
- **Scope: calculator only — owner's explicit choice, 2026-08-15.** Offered the wider option of alerting on the nav and floating WhatsApp buttons too; owner picked calculator-only, because people tap those buttons to ask "are you open?" as often as to order and an alert with no basket behind it is noise. Accepted cost: an order arriving via the home-page button, Instagram or the saved number still lands silently. Review after a week of real use — if real orders keep turning up with no alert before them, wire the other buttons by lifting `notifyKitchen()` into a shared script.
- Verification: `npm run build` green (0 errors, 0 warnings, `Complete!`); `skills/qa-check.md` steps 1–5 pass (13 JSON-LD blocks parse, 0 emoji, rating still 4.9/16, no non-veg hits). The alert path was **driven for real** rather than reasoned about — headless browser against the built `dist/` over HTTP with the clock frozen at 19:00 and the ntfy request intercepted instead of sent: a ₹516 basket published one alert on Copy, none on the second click (dedupe holds), one more on the WhatsApp click, title `New order Rs 516 (delivery)` in pure ASCII at `Priority: urgent` with the ₹-bearing quote intact in the UTF-8 body. Then rebuilt with `ntfy_topic: ""` and re-ran the same script: **zero** requests — off-by-default proven the same way Phase 5 proved it for Umami, not assumed.
- **Open for the owner:** no account to create — subscribe the laptop and the three phones to the topic already in `site.config.json`, make Android/iOS actually ring (skill §4), then the `curl` test and the end-to-end test on the live page (skill §6).

### 2026-07-30 — PHASE 6 COMPLETE / LAUNCH
- Pre-launch QA gate (Sonnet subagent): 10 gates run; verdict NO-GO on 3 a11y blockers (heading order, 2 contrast pairs, aria-label mismatch) — all present since the parity port, below the §1 ≥95 bar.
- Blockers fixed on feature/a11y-launch-blockers with pixel-parity pinning; Lighthouse re-run: **a11y/perf/SEO 100 on all 6 audited pages**; best-practices 100 except /contact/ 79 (Google Forms iframe — documented accepted exception to PRD §1).
- Launch: v1 archived as tag v1-legacy (3a97764); release PR #2 develop→main; merge conflict (v1 Umami hotfix vs v2 deletions) resolved keeping deletions; owner merged PR #2; **tag v3.0.0** (683b276); deploy.yml build+deploy green on main; live URL verified (v2 title, Umami, real hours, 9 stubs + all routes 200).
- Note: repo also has a Netlify integration building deploy previews on PRs (discovered during launch — harmless, useful for previews).
- Pages settings still report "legacy" mode but workflow deployments are serving; the failing legacy build on each main push is harmless noise — owner should still switch Settings→Pages→Source to "GitHub Actions" to silence it.
- OWNER CHECKLIST (the traffic levers, in priority order):
  1. GBP: verify claim ("Own this business?" test), fix address (remove coordinate fragments; match site.config.json street), hours → 11:30 AM–11:30 PM, add UPI/delivery/takeaway service options
  2. Google Search Console: add property, submit sitemap-index.xml, request re-crawl of / (fabricated-rating markup removal + new content)
  3. Umami dashboard: confirm Realtime shows visits; watch call_click/wa_click events
  4. Weekly rhythm per docs/SEO_PLAYBOOK.md: GBP posts/photos, review requests with every order, Instagram geotags


### 2026-07-30 (Phase 3.5 — visual polish, G1+G2)
- Owner scoped Phase 3.5 to G1 "Living cards" (cursor-tracking red-gold glow + depth/border/zoom on menu/feature/blog cards) + G2 "Brand micro-motion" (HAPPINESS. shimmer 8s, button press/hover feel, WA FAB pulse ~9s). G3 glass + G4 orbit cursor REJECTED.
- Implemented as an additive layer: src/styles/polish.css + public/scripts/polish.js (pointer:fine only, rAF-throttled); deleting the polish.css import restores exact v1 parity. All effects killed under prefers-reduced-motion (including v1's own reveals, which had no reduced-motion guard).
- Verified by screenshot: hover glow visible and classy on expanded Pizza accordion cards; build green. Awaiting owner live approval on preview before phase close.

### 2026-07-30 (owner decisions post-Phase 3)
- Analytics: Umami confirmed; v1 trackers (GTM/gtag/Yandex) stay dropped. Owner may audit later.
- Business is 100% PURE VEG → recorded in PRD §3, binding for Phase 4 SEO/copy.
- Bonus /menu/ page: KEEP. veg-vs-non-veg footer bugfix: understood/accepted.
- Owner requests a **visual-polish enhancement phase (3.5)** on top of the v1-parity base — plan to be approved before implementation. This AMENDS the "zero visible changes" lock: parity was the floor, approved enhancements now allowed.

<!-- date / what was done / what's next / open questions -->

### 2026-07-29
- PRD.md, prompt.md, PROGRESS.md created. Decisions locked: stay on github.io (domain-ready), Call + WA order builder, English only, in-place rewrite.
- PRD revised after owner review: Astro pinned to latest major (7.x, verified via npm — not 5), desktop promoted to first-class layout (§8), context/memory system documented (§10.1) + CLAUDE.md added, continuous QA gates 0–4 (§10.2), Phase 2 split into 2a design research (inspiration brief) + 2b design system.
- Owner decisions: photos locked to existing catalogue shots (2a must pick a style that flatters them — no glassmorphism dogma); real GBP rating may be shown (honest values only); delivery = own + Zomato/Swiggy with slab pricing; menu prices + delivery charges must be editable by a non-tech person via GitHub web editor (PRD §6 binding).
- **Phase 0 executed and closed** — see checklist above. All PRD §14 Phase-0 items resolved.
- Branching model adopted (binding, see skills/release-manager.md): main = live v1, FROZEN until one-shot v2 launch merge; develop = integration; feature/* cut fresh from origin/develop, merged --no-ff. skills/release-manager.md + skills/release-recovery.md created (adapted from Portfolio). Planning files pushed to main; develop cut from main.
- Next: **Phase 1 — Architecture** (Fable 5, high effort). Fresh session, paste prompt.md. Work happens on feature branches off develop. Seed site.config.json with §3 values incl. delivery slabs.
- **Phase 1 executed and closed** — Astro 7.1.6 + Tailwind 4 scaffold, Zod schemas, data layer, route stubs, CI, AGENTS.md + skills, 10/10 fresh-eyes QA pass. See checklist above.
- **Phase 2a — Design research executed** (Sonnet 5, medium effort, `feature/phase-2a-research` off `origin/develop`). Read 10 real catalogue photos (product + combo images) across categories plus the current logo/brand assets directly (not from memory); researched 21st.dev card patterns, Awwwards food/drink sites, Zomato design language, 2026 glassmorphism-vs-liquid-glass guidance, and 2026 food-brand logo trends via web search. Wrote `design/RESEARCH.md`: photo audit (black backgrounds are the unifying trait — recommends a dark warm-charcoal canvas over glassmorphism, which would fight the black-background photos; crop-consistency is the real weakness, fixable in CSS), logo critique (current oven-in-a-speech-bubble icon doesn't parse as a food/warmth motif; rust-red hue and the oven concept itself are worth keeping), 8 referenced patterns with why-they-convert, 3 concrete logo directions in words, and a clear recommendation: "Editorial Ember" (dark) as primary direction + a warmed-up light "Fresh Counter" as the contrast direction for Milan's A/B, both sharing one logo concept and the existing accent red.
- Committed to `feature/phase-2a-research`, merged `--no-ff` into `develop`, pushed. Feature branch deleted (local + remote).
- **Phase 2a closed:** Milan reviewed the brief summary and reacted — both mockup directions approved as proposed; logo directions locked to Ember Arch + Flame Mark (Stamp/Seal rejected). Phase 2b unblocked.
- Next: **Milan reviews `design/RESEARCH.md`**, then **Phase 2b — Design system** (Fable 5, medium-high effort). Fresh session, paste prompt.md.

### 2026-07-30
- **Phase 2b closed** with a hard pivot: after seeing 3 built mockup directions (Ember Editorial, Fresh Counter, v1-Faithful) + 2 logo concepts, owner rejected all of them — binding call: "Copy what's on main and rebuild the exact same code on the latest tech stack. That's all." PRD §8 rewritten as a superseded block; brand-refresh scope cancelled; WA cart-builder parked.
- **Phase 3 — Pixel-parity migration executed** (Sonnet 5, standard effort, `feature/phase-3-migration` off `origin/develop`). See the Phase 3 checklist entry above for the full breakdown (components, pages, SEO, parity table, bugs found/fixed, the one allowed diff). Build green; merged `--no-ff` into `develop`; rebuilt on merged `develop` (green); pushed; feature branch deleted (local + remote).
- **Owner questions raised, unresolved (surface before Phase 4):**
  1. GTM / Google Ads gtag / Yandex Metrika (with webvisor session recording) from v1's `<head>` were dropped rather than ported — PRD §5 names Umami as the analytics solution and these read like legacy ad-tech, but confirm before Phase 5 wires up Umami whether any of the old tracker IDs still need to stay live in parallel.
  2. `blog-veg-vs-non-veg.html` on live v1 is missing its `<script src="script.js">` tag — footer, mobile menu, and all `.animate-on-scroll` content never activate on that one page. Treated as an accidental bug and NOT reproduced (this post now gets the same footer/scripts as its siblings — the only "taller" screenshot diff in the parity table traces to this). Flag in case this was somehow intentional.
  3. `blog-pizza-under-300.html` has a doubled `<div class="hero-container">` (copy-paste bug) that narrows its hero text at mobile widths — this one WAS reproduced faithfully (trivial, no functional harm) rather than fixed, unlike #2. Confirm this asymmetry (reproduce the harmless bug, fix the harmful one) is the right call.
  4. The Restaurant JSON-LD's `menu` field now points at `/menu/` (a real, always-in-sync HTML page) instead of v1's `https://theovenvibe.github.io/menu.json` — that raw file was never actually served publicly (data.ts reads it from the repo root, not `public/`), so the old reference was a dead link. `/menu/` itself is a Phase-1 stub page (not a v1 page, no pixel-parity target) restyled with v1's design system for Phase 3 — confirm it's fine to leave as a bonus page pending Phase 4 content work, or if it should be unpublished until then.
- Next: **Phase 4 — Content, copy & SEO** (Opus 5, medium effort). Fresh session, paste prompt.md.

### 2026-07-30 (Phase 4 — Content, copy & SEO)
- **Phase 3.5 closed:** owner approved the polish layer on the live preview. Recorded in the checklist above.
- **Phase 4 executed** (Opus 5, medium effort, `feature/phase-4-content-seo` off `origin/develop`). Full breakdown in the Phase 4 checklist entry above. Seven commits: render-time menu copy cleaning → Seo component + structured data → premium copy pass + veg badge → FAQ single-source fix → /sundargarh/ rebuild → blog rewrites → stub noindex fix → playbook/AGENTS.
- **Visible changes for owner review** (all inside the approved scope, but worth a look before launch): pure-veg badge on home/menu/contact/footer; hero sub-copy and trust row (emoji icons gone, rating now reads "4.9/5 on Google (16 reviews)"); "View Menu" → "See the Menu"; Party banner now "Party & Bulk Orders" with a **call-first** CTA plus a WhatsApp fallback; "Why The Oven Vibe?" cards rewritten; /menu/ and /contact/ gained real copy and call/WhatsApp buttons; /contact/ gained a NAP/hours/delivery block; /sundargarh/ is a new full page; all five blog posts rewritten (two of them substantially — see the honesty fixes list); footer gained a NAP line and lost the dead Facebook link; 404 headline lost its pizza emoji.
- **Owner questions raised by this phase:**
  1. **Street address:** `Bijaya Talkies Road, In front of Subasini Clinic` is now in `site.config.json` and appears in JSON-LD on every page + in the affordable-pizza post. Confirm it matches the Google Business Profile **exactly**. NAP mismatches are a real local-ranking cost.
  2. **The `/faq/` hours contradiction is resolved in favour of `site.config.json` (11 AM – 9 PM, all days).** If the real timings differ, fix `site.config.json` — the whole site follows it now.
  3. **`blog/affordable-pizza` no longer lists the "Chicken King" entry** (a pure veg kitchen recommending "Chicken Sausage Pizza + Chicken Popcorn" undercuts the positioning). The post is now four spots instead of five and retitled accordingly. Say the word if you want the entry back with veg picks you can vouch for.
  4. **Nav's "Order Now" button was left as-is** — "Order on WhatsApp" is the better copy but risks wrapping the desktop nav. Trivial to change if you want it.
  5. Still open from Phase 3: GTM/gtag/Yandex Metrika stay dropped; the veg-vs-non-veg script bugfix and the pizza-under-300 doubled-div reproduction are both unchanged.
- Next: **Phase 5 — Ops & docs** (Sonnet 5 + Haiku 4.5, low effort). Fresh session, paste prompt.md. Phase 5 should also fold `docs/SEO_PLAYBOOK.md` Part B into a short owner-facing checklist and consider moving the Zomato/Swiggy/Maps links from `src/lib/seo.ts` `LINKS` into `site.config.json` (they are business values, and golden rule #2 says those live in the config).

### 2026-08-14 (Pricing revision, FAQ & price calculator)
- **Menu repriced and cut** on `feature/pricing-and-calculator` (off `origin/develop`): demand-tiered price rise replacing the earlier flat +₹20 (anchors held at ₹129/₹99/₹89, bestsellers +₹10, mid-tail +₹10–20, impulse/add-ons +₹20), then 32 SKUs down to 18 — the wok station retired after the gas price rise, plus three sandwich experiments, potato pops and pocket bombs dropped on owner's call. Classic Red Sauce Pasta kept despite low volume (owner's call). Combos re-priced to ~10% off parts and re-checked to stay above their own main item's solo price.
- **Delivery pricing rebuilt** from real order data (260 delivered orders) and current fuel cost (₹109.55/l, ~10 km/l, round trips, owner's time at ₹100/hr): slabs 0–2 km ₹29 / 2–4 km ₹69 with minimums ₹249/₹399 (₹199 in the weekday afternoon window), free delivery above ₹499 within 2 km, beyond 4 km routed to Zomato/Swiggy, late-night and rain surcharges, quiet-hour and pickup/pre-order discounts, campus batch rate, and a ₹149 cap covering every delivery charge. The whole model lives in `site.config.json`; `src/lib/pricing.ts` is the shared engine.
- **Banner, FAQ and a new `/price-calculator/`** all render from that config, so the numbers cannot drift apart. Owner rule applied throughout: **every price claim carries its unlocking condition in the same sentence** — "₹19 delivery" always names its ₹199 minimum, free delivery always names its km limit, and late-night/rain are disclosed on the banner rather than met at checkout.
- **Removed the self-declared "regular customer" tick and the FAQ answer promising surcharges stop after 3 orders** — there is no system tracking who a regular is, and the answer claimed "the kitchen keeps track", which was not true. Policy stays in `site.config.json`, annotated, applied by hand until repeat customers are actually tracked.
- Verification: `npm run build` green; `skills/qa-check.md` steps 1–5 pass (0 JSON-LD failures, 0 emoji, rating matches config, 0 non-veg hits, calculator page has title/description and no image missing alt — the nine flagged pages are the v1 redirect stubs, missing descriptions by design); pricing engine exercised against 10 cases including the weekend/afternoon boundary and the worst surcharge stack; home + calculator screenshotted at 390px and 1280px.
- **Owner questions raised by this work:**
  1. The live v1 line "FREE delivery on orders above ₹599 (within 0–8 km)" promised free delivery to 8 km, which costs up to ₹199 of riding on a ₹599 order. Now scoped to 2 km — be ready to honour the old promise for anyone who asks in the first week.
  2. The scooter returns ~10 km/l against a normal 40–50. Every 2–4 km delivery earns only ₹5–7 until that is fixed, versus ₹71–73 after. Worth measuring full-tank-to-full-tank before spending on repairs.
  3. Direct (WhatsApp/phone) orders are not recorded anywhere the dashboard can read — which is why the regulars policy cannot be administered. Logging them is the prerequisite for putting that benefit back.
- Next: **owner UAT on the release PR**, then merge `develop` → `main` and tag. Not merged by the agent — owner's explicit instruction after an earlier PR was raised against `main` by mistake.

### 2026-08-14 (Price calculator hardening — v3.2.0 → v3.7.0)
Ten releases, all owner-driven from using the live page. Each shipped through `feature/*` → `develop` → release PR → tag, with `npm run build` and `skills/qa-check.md` green at both gates.

- **v3.2.0** — rain toggle in the calculator; late-night window extended to 02:00; limited late-night menu (pasta, maggi and the Pasta Treat Combo grey out, quantities cleared); closed-hours state between 02:00 and 11:30 that names the opening time instead of quoting an order the kitchen cannot cook.
- **v3.2.1** — a prepaid order cannot take a doorstep surcharge, so rain is waived for it; the ₹10 pre-order discount removed (it paid people for saying "later" with no commitment). Free delivery no longer survives into the late-night window.
- **v3.3.0 / v3.4.0** — pickup discount floored at ₹299 (₹30 off a ₹100 order was a ₹15 loss; break-even is ₹200; at ₹399 only 18% of orders would qualify and the discount would stop diverting deliveries). Baskets below the floor are told what would earn it. The whole "Other" group is hidden on pickup. Slots cannot be set in the past, and the page follows the clock until a slot is deliberately chosen.
- **v3.5.0** — late-night prepayment is the *condition* of firing the oven, not a rain waiver: a late order is prepaid **and** still rain-charged, and the prepaid tick box is hidden inside the window because it is not a choice there.
- **v3.5.1 / v3.5.2** — everything the customer sends reads as their own acknowledgement ("please send your QR so I can pay it", "I understand that… is added to my bill"), so the message doubles as a record of what was agreed. Pickup orders had no acknowledgement at all; that gap is closed.
- **v3.6.0 / v3.7.0** — pre-ordering became an explicit mode with a 3-hour prep notice rather than an inference from the clock, and the chosen slot leads the message. Every rule is judged at that slot: a pre-order for 11:45pm gets late-night pricing and its limited menu.

**Bugs found in my own verification, both recorded in MEMORY.md:** a probe that read back the `hidden` property it had just set (passing while the element was still painted, because a class `display` beats `[hidden]`), and a build grep matching `- 0 errors` from `astro check` while an `astro build` failure printed underneath it.

**Open for the owner, unchanged:** log direct orders somewhere the pipeline can read (the Zomato-only blind spot has now bent three analyses); measure the scooter's real mileage; switch Settings → Pages → Source to "GitHub Actions" to stop the phantom Jekyll failures; fill `unit_cost` so the menu matrix shows margin instead of price.

### 2026-08-16 (Phase 0 — order capture, backend side)

The direct-order blind spot flagged in every session above finally has a fix. Cross-repo work with `the-oven-vibe-backend` (see that repo's PROGRESS.md for the Worker/D1 half); this entry covers what changed here, on `feature/order-capture-phase0` off `origin/develop`.

- **`/checkout/` now POSTs every send to the backend Worker as a `pending` order** — fires on the same click that opens WhatsApp or copies the quote, `keepalive: true`, never awaited, swallowed on failure (AGENTS.md rule 5: a backend outage must never block an order). Gated on `copyBtn.dataset.quote` being populated, which order-form.ts only does once the basket, slot and customer details are all valid — so this piggybacks on validation that already existed rather than duplicating it.
- **A `device_id` (UUID) is now generated into `localStorage`** (`ovenvibe.device_id.v1`) on first checkout visit and sent with every order — the join key Phase 3 will use to link a push subscription to a customer (PRD §7.1).
- **`publishNtfy` no longer talks to `ntfy.sh` directly.** It POSTs `{title, body, priority, tags}` to the Worker's `/alert`, which holds the real topic as a secret. `notify.ts`'s header-escaping (`asciiHeader`) moved server-side with it and was dropped from this repo — dead code once the client stopped building ntfy headers itself.
- **`site.config.json`'s `notifications.ntfy_topic` is gone**, replaced by `backend.worker_url` (`https://oven-vibe-backend.theovenvibe.workers.dev`) — a URL, not a secret, so it is fine in a public static site. Renamed straight through: `site-config.ts` schema, `OrderFormConfig.ntfyTopic` → `workerUrl` in `order-form.ts`, and the three call sites (`checkout.astro`, `price-calculator.astro`, `PartnerClickAlerts.astro`).
- Distance band (`'0-2 km'` / `'2-4 km'` / `'beyond 4 km'`, or the exact typed km) and the pre-order slot (ISO datetime) are read straight from the existing `OrderOptions.astro` DOM by `checkout.astro`'s own script — no new fields, no new questions asked at checkout, matching PRD §7.2's "the site never asks where, only how far."
- Deliberately **not touched**: `order-form.ts`'s hook surface (no new hooks — reused the existing `onUpdate` hook to capture the priced `QuoteResult`), the WhatsApp message itself, and `price-calculator.astro`'s behaviour beyond the config rename (it fires no order POST — `primaryAction: 'handoff'` there means nothing has been ordered yet, same as before).
- Verification: `npm run build` green (0 errors); `skills/qa-check.md` steps 1–5 pass (0 JSON-LD failures, 0 emoji, rating 4.9/16 matches config everywhere, 0 non-veg word hits, the same 9 pre-existing v1-redirect-stub pages missing descriptions as the 2026-08-14 session, 0 images missing alt).
- **Owner questions raised:**
  1. This was pushed as a PR against `develop`, not merged — same convention as every prior phase. Needs your UAT before merging.
  2. The Worker needed a one-time manual step this session couldn't do non-interactively: registering the account's `workers.dev` subdomain in the Cloudflare dashboard (Workers & Pages → Domains → toggle "Worker URL" on). Already done for `oven-vibe-backend`; flagging in case a future Worker in this account hits the same wall.
- Next (do not start in this session): **Phase 1 — Admin: Today + Orders** (backend repo). See `the-oven-vibe-backend/HANDOFF.md`.

### 2026-08-16 (Phase 2 — PWA)

Backend Phases 0 and 1 shipped same-day (see `the-oven-vibe-backend/PROGRESS.md`), owner asked to continue straight into Phase 2 — the website-repo half, on `feature/pwa-phase2` off `origin/develop`.

- **`public/manifest.webmanifest`**: name, short_name, `theme_color` (`#e63946`, matching the existing `<meta name="theme-color">`), `display: "standalone"`, three icon entries. Linked from `Layout.astro`'s `<head>`.
- **Icons**: tried to isolate just the oven-in-cloud mark from the master brand lockup (`static/images/brand_images/The Oven vibe_logo.webp`, 2362×2362) via connected-component pixel analysis, to get a clean minimalist app icon — dead end. The cloud icon and the wordmark's "N" are fused in the source artwork itself (touching/overlapping by design), not two separable shapes, so no crop or masking approach could isolate one without the other. Fell back to the already-published `apple-touch-icon.png` (180×180, the full logo lockup — same asset already serving as the site's icon in browser tabs and existing Home Screen bookmarks) as the source, upscaled cleanly to 192/512, plus a maskable 512 variant (logo at 65% scale, centered, so OS mask shapes don't crop it). Not a new design — reused what's already live. **Worth a design pass later** if a proper standalone icon mark is ever wanted; flagging rather than inventing one now (no new-design authority this phase).
- **`public/sw.js`**: minimal — `install`/`activate` for a small shell cache, network-first `fetch` handler (the menu/prices change often enough that a stale cached page would be worse than no cache at all). No `push` event handler — that's Phase 3's job once VAPID subscriptions exist.
- **`src/components/PwaInstall.astro`**: registers the service worker on `load`, and shows one soft, dismissible banner — never a native prompt unprompted. Android Chrome: captures `beforeinstallprompt`, only calls `.prompt()` from a tap on our own button. iOS Safari: no such event exists (PRD §4.2), so a plain "Share → Add to Home Screen" instruction shows instead, gated on a narrow iOS+Safari check (excluding Chrome/Firefox-on-iOS, which wrap Safari's engine but aren't Safari). Dismissal is remembered 30 days, same rate-limit philosophy as PRD §8.2's push soft-ask.
- Verification: `npm run build` green; `skills/qa-check.md` steps 1–5 pass; drove it in a real browser (not just typechecking) — confirmed the service worker registers and reaches `active` state, the manifest fetches and parses with all three icon URLs resolving 200, and all three icon files serve as `image/png`.
- **Not done, on purpose:** no push subscription wiring, no VAPID key in the site config, no service-worker `push` handler — all Phase 3. No campaign UI.
- Next (do not start in this session): **Phase 3 — Push subscribe** (backend repo, touches both repos — VAPID public key into this site's config, subscription storage in the Worker). See `the-oven-vibe-backend/HANDOFF.md`.

### 2026-08-16 (Phase 3 — push subscribe)

Fourth phase this session (`feature/push-subscribe-phase3` off `origin/develop`), touching both repos in one sitting for the first time. Backend half (migration, `POST /subscriptions`) is in `the-oven-vibe-backend/PROGRESS.md`.

- **`site.config.json`** gained a `push.vapid_public_key` field (public, not a secret — the private half stays a Worker secret). Schema validated in `site-config.ts` (base64url, ~87 chars).
- **`src/lib/device.ts`**: extracted `getDeviceId()` out of `checkout.astro` — Phase 3 needs the same id in a second place (the subscribe flow) and it must never diverge from the one an order was placed with, or the two can never link (PRD §7.1).
- **`src/lib/push-signal.ts`**: the handoff between "order just sent" (`checkout.astro`) and "show the soft-ask" (the new `PushSubscribe.astro`, rendered globally). Deliberately `localStorage`, not `sessionStorage` — iOS Safari can reload a backgrounded tab under memory pressure while WhatsApp has focus, which would silently drop a `sessionStorage` flag before the customer ever returns.
- **`src/components/PushSubscribe.astro`**: the soft-ask card, PRD §8.2's exact sequencing — fires on `visibilitychange` after an order send, never on load. `Notification.requestPermission()` is called from exactly one code path (the "Yes" button), so "Not now" can never burn the browser's one-shot permission. On accept: `PushManager.subscribe()` with the VAPID key, then `POST` to the Worker's `/subscriptions`, `device_id` shared with the order. On iOS, gated on already being installed (PRD §4.2 — push doesn't work there otherwise).
- **Two soft banners can now exist** (this and Phase 2's install prompt) — extracted their shared CSS into `global.css`'s `.soft-banner`/`.soft-banner-actions` (was duplicated inline in `PwaInstall.astro`) and added `src/lib/soft-banner.ts`'s `anotherBannerVisible()` guard so they never stack in the same fixed bottom-center slot.
- **`public/sw.js`** gained `push` (parses `{title, body, url}`, calls `showNotification`) and `notificationclick` (focuses an already-open matching tab instead of stacking a duplicate, else opens one) — no campaign exists yet to send one, this just makes the client capable of receiving.
- Verification: `npm run build` green, `skills/qa-check.md` steps 1–5 pass. Real UAT against the deployed Worker (not just typechecking): confirmed a subscription created before any order lands with `customer_id = NULL`, then gets linked the moment a matching-`device_id` order arrives; separately confirmed a subscription created *after* an order already exists links immediately. Did **not** attempt to drive the native browser permission dialog through browser automation — that dialog lives outside page/DOM context and a stuck `Notification.requestPermission()` call can hang the tab; the client-side `PushManager` call itself is standard MDN-documented usage, so confidence there rests on that rather than a live grant/subscribe round-trip. Test rows deleted after.
- **Not done, on purpose:** no campaign compose/send UI, no admin visibility into subscriptions — Phase 4.
- Next (do not start in this session): **Phase 4 — Send one campaign to everyone**. See `the-oven-vibe-backend/HANDOFF.md`.

### 2026-08-16 (bug fix, off-phase) — checkout was silently deleting the basket when the kitchen is closed

Found by the owner mid-Phase-4-UAT: add an item any time, land on `/checkout/`
while the kitchen happens to be closed (e.g. 2am, before the 11:30am open),
and the entire basket vanished — no error, no warning, just gone. Ticking
"Pre-order" afterward didn't bring it back, because it was already gone.
Pre-existing bug from the 2026-08-14 pricing session, unrelated to any of
tonight's phases; fixed on `fix/preserve-basket-when-closed` off
`origin/develop` since it was blocking real pre-order use, not a new phase.

- **Root cause**: `order-form.ts`'s `applyAvailability()` called
  `row.setQty(0)` on every basket line whenever the kitchen state was
  `'closed'` — and on `/checkout/`, `setQty` persists straight to
  `localStorage` via `setItemQty`, which drops any line at qty 0. This ran
  on page load, before the customer had any chance to tick "Pre-order."
- **Fix**: stopped mutating quantity for unavailability at all. Added a
  `Set<string>` of currently-unavailable row names inside `order-form.ts`'s
  own closure, populated by `applyAvailability()` and read by `subtotal()`
  and `chosenItems()` to exclude those rows from the total and the
  WhatsApp/copy quote — same financial correctness as before (an unmakeable
  item was never priced or sent), but the basket itself is never touched.
  `BasketRow` still has no stable id in its shared interface, so this keys
  on `row.name`, which is safe given cart.ts's own invariant of one line per
  distinct item.
- Also reworded the two "kitchen closed" messages (the availability banner
  and the quote-output warning) to name the actual fix — "tick Pre-order
  and pick a time after we open; nothing in your basket is lost" — instead
  of the old, useless "change the time above."
- **Verified in a real browser**, not just build/typecheck: added two items
  at the real current time (kitchen genuinely closed), confirmed both stayed
  visible in the basket (greyed out, "Not cooked at this time", struck-through
  price) instead of disappearing; ticked Pre-order, chose 1pm; confirmed a
  correct priced breakdown (₹568, food + free delivery) and a live send
  button with name/phone filled in.
- `npm run build` green, 0 errors.
