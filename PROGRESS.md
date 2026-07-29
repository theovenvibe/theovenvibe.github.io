# PROGRESS

## Status: 🔒 DESIGN LOCKED = v1 AS-IS (2026-07-30). Owner rejected all 3 mockup directions; final decision: pixel-parity migration of main into Astro, zero visible changes. Phase 3 (migration) DONE 2026-07-30 — parity verified, merged to develop.

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
- [ ] **Phase 4 — Content, copy & SEO** (Opus 5, medium)
  - Exit: Rich Results Test passes; fabricated reviews gone; zero placeholders; Lighthouse SEO 100
- [ ] **Phase 5 — Ops & docs** (Sonnet 5 + Haiku 4.5, low)
  - Exit: local-LLM acceptance test passes via fresh subagent
- [ ] **Phase 6 — QA & launch** (Sonnet 5, low-standard)
  - Exit: PRD §1 metrics met per page; redirects verified in prod; GBP checklist handed to owner

## Session log

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
