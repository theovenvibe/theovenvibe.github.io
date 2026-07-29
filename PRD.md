# PRD — The Oven Vibe: Digital Menu & Lead-Gen Website (v2 rebuild)

> **Status:** Approved 2026-07-29. This document is binding. Read `PROGRESS.md` for current phase state.
> **Owner:** Milan Behera · **Repo:** this repo (in-place rewrite; git history and `theovenvibe.github.io` URL preserved).

---

## 1. Purpose & Goals

The Oven Vibe is a cloud kitchen in Sundargarh, Odisha (pin 770001). The website is a **digital menu that converts visitors into direct leads** — primarily phone calls, secondarily WhatsApp orders. It is *not* an ordering platform: no payments, no backend, no accounts.

**Success metrics (measured post-launch):**

| Metric | Target |
|---|---|
| Lighthouse mobile (all 4 categories, every page) | ≥ 95 |
| LCP on 4G mobile (menu + home) | < 2.0 s |
| Tap-to-lead: any page → call/WA initiated | ≤ 2 taps |
| Menu price/photo/description change by a local LLM | 1 file edit, < 5 min, build green |
| Google indexing | All pages indexed; rich results valid for Restaurant + Menu |

**Decisions already made (do not re-litigate):**
- Hosting stays **GitHub Pages at `theovenvibe.github.io`** for now. Everything (canonical URLs, JSON-LD, sitemap) must be driven by a single `SITE_URL` constant so a custom domain later is a one-line change + redirects.
- Lead flow: **sticky Call button everywhere + WhatsApp order builder** (client-side cart → prefilled `wa.me` message). No backend.
- **English only.** Hindi/Odia allowed as flavour in taglines, never in structural content.
- **Rewrite in this repo.** Old HTML/CSS/JS deleted in Phase 1; images and `menu.json` are the migrated assets.

## 2. Audience & Positioning

- **Primary:** Sundargarh-town families, students, young professionals browsing on **budget/mid Android phones over 4G**, often via Instagram bio link or Google search "pizza/burger Sundargarh". Mobile-first is non-negotiable; desktop is secondary.
- **Secondary:** Party/bulk-order inquirers (birthdays, small events) → call.
- **Positioning:** "Fresh, hot, oven-baked — made in Sundargarh." Appetite-first visuals, honest local pricing (₹69–349), instant human contact. The brand should feel *modern-premium but approachable*, never corporate.

## 3. Business Facts (single source of truth for copy)

| Fact | Value |
|---|---|
| Name | The Oven Vibe |
| Phone / WhatsApp | +91 96922 61138 (`tel:+919692261138`, `https://wa.me/919692261138`) |
| Email | theovenvibe@gmail.com |
| Address | Sundargarh, Odisha 770001, IN · geo 22.1170, 84.0382 |
| Hours | Mon–Sun 11:00–21:00 |
| Instagram | instagram.com/theovenvibe |
| Platforms | Zomato & Swiggy (menu.json mirrors the Zomato catalogue) |
| Delivery | **Own delivery + Zomato/Swiggy.** Slabs: **₹29** (0–2 km) · **₹59** (2–4 km) · **₹99** (4–8 km) · **FREE above ₹599** (0–8 km). Hook: "Delivery starts at just ₹29." Values live in `site.config.json` (§6), never hard-coded in pages |
| Google Business Profile | **Claimed & verified: 4.9★, 16 reviews** (as of 2026-07-29). Link: https://share.google/wlwoG9JmeY3KV3dWU (entity `/g/11zj4x092l`). Count updated via `update-rating.md` skill |
| Hero dish | **Paneer Makhni Royale Pizza** (`752649876`, ₹199) — face of the brand on home hero + OG image |
| Price range | ₹69–₹349 |
| Cuisine | Pizza, Burger, Fried Rice, Fries, Snacks, Pasta, Sandwich |

⚠️ **Binding content rule:** the old site's JSON-LD carried a fabricated `aggregateRating` and fake "Local Customer" reviews — those never come back. The **real** GBP rating (confirmed in Phase 0) MAY appear in copy and structured data, with the count kept honest and updated via a skill (`update-rating.md`).

## 4. Site Map & Page Requirements

| Route | Purpose | Key requirements |
|---|---|---|
| `/` Home | Appetite hook → menu | Hero with signature dish photo (LCP-optimized), 4–6 bestsellers, combo strip, category tiles, trust row (hours/location/fresh-to-order), sticky Call CTA, footer with NAP + socials |
| `/menu/` | The core product | All items grouped by category with filter chips; each card: photo, name, veg/non-veg mark, description, price, **Add** (to WA cart) + per-item WA deep link; combos + add-ons sections; unavailable items (status ≠ available) hidden or greyed per a build-time flag |
| `/contact/` | Direct lead capture | Big Call + WhatsApp buttons, hours, map embed (lazy, click-to-load), Instagram QR, bulk/party-order blurb |
| `/faq/` | SEO + trust | Migrated + rewritten FAQs; FAQPage JSON-LD |
| `/blog/` + posts | Local SEO surface | Migrate the 5 existing posts into content collections; structure for future posts via skill |
| `/sundargarh/` | Local landing page | Rework of `sundargarh-770001.html`: "food delivery in Sundargarh 770001" intent page |
| `/404` | Recovery | Branded, links to menu + call |

**Global:** sticky bottom action bar on mobile (Call · WhatsApp · Menu). WA order-builder cart is available on every page but only prominent on `/menu/`.

## 5. Tech Stack (locked)

Same toolchain and conventions as the proven Portfolio setup, but on **current majors** — the Portfolio froze at Astro 5; this build does not inherit that freeze.

- **Astro — latest stable major at Phase 1 scaffold time** (7.1.x as of 2026-07-29; verify with `npm view astro version` and fetch the current Astro docs before scaffolding — model training data lags behind Astro releases, so Phase 1 must work from live docs, not memory). Static output, zero client JS by default. **Tailwind CSS v4 latest** (`@tailwindcss/vite`), **TypeScript strict**, Node ≥ 22.12 (Astro 7 floor; CI runs Node 24).
- **Motion** (`motion`) for scroll reveals/micro-interactions + **Lenis** for smooth scroll — both loaded lazily, both disabled under `prefers-reduced-motion`.
- **Content:** `menu.json` stays the single source of truth (it mirrors the Zomato catalogue — do not restructure it away). Astro loads it through a **Zod schema** (`src/schemas/menu.ts`) so a bad edit fails the build with a readable error, not a broken page. Blog/FAQ use content collections.
- **Cart/order builder:** one small vanilla-TS island (`<script>` or Astro island), state in `localStorage`. No framework runtime.
- **CI & branching:** GitHub Actions builds every push; the deploy job is **gated to `main`**, which stays frozen serving the v1 site until the one-shot launch merge (full model: `skills/release-manager.md` — binding). `astro check && astro build` must pass before any commit. Note for Phase 1: the repo currently uses branch-based Pages deploy from `main`; the Actions workflow must be designed so v1 keeps serving until launch, with the Pages source switch (if required) documented as a Phase 6 launch step.
- **Analytics:** Umami Cloud (free tier) with custom events `call_click`, `wa_click`, `wa_order_sent` — this is how "leads generated" is actually measured. Cookie-less, no banner needed.
- **Explicitly out:** React/Vue, CMS, databases, payment, service workers (revisit later), JXL images (no browser support — AVIF/WebP only; JXL files deleted in Phase 1 to slim the 217 MB repo).

## 6. Menu Data Model

`menu.json` keeps its three arrays (`Menu_Items`, `Combos`, `Add_ons`) and existing field names (Zomato mirror). Phase 1 extends it non-destructively:

- Ensure every item has `category` (the top-level grouping the menu page renders), `veg` (boolean, derivable from "[Veg preparation]" markers), and `image_code` (maps to `static/images/**/{code}.avif|webp`).
- Zod schema enforces: price is a positive integer, status ∈ {available, unavailable}, image file existence checked at build time (warn, don't fail, with a placeholder fallback).
- **The maintainability contract (§10) is written against this file:** price change = edit one number; new item = append one object + drop one image in.
- **`site.config.json` (new, Phase 1):** everything a non-tech person changes that isn't a menu item — delivery charge, free-delivery-above threshold, delivery radius note, hours, phone, rating + review count, announcement banner text (e.g. "Closed for Holi"). Zod-validated like the menu. Pages read only from here — no business value is ever hard-coded in a component.
- **Non-tech edit path (binding):** both JSON files must be editable from the **GitHub web editor on a phone** — open file → change number → commit → site auto-deploys in ~2 min. If an edit is malformed, the build fails and **the live site stays on the last good version** (Pages serves the previous deploy), so a non-tech editor can never break production. Each skill file includes this plain-language browser flow, not just CLI steps.

## 7. Lead Conversion Spec (the actual product)

1. **Sticky Call button** — visible on every page, every viewport. `tel:+919692261138`. Fires `call_click`.
2. **WhatsApp order builder** — progressive enhancement:
   - Base (no JS): every item card carries a plain `wa.me/919692261138?text=Hi! I'd like to order: {item} (₹{price})` link. Site is fully usable with JS off.
   - Enhanced: "Add" buttons build a cart (localStorage), floating cart bar shows count + total, "Order on WhatsApp" composes one URL-encoded message: greeting, line per item (`2× Veg Fried Rice — ₹358`), total, "Name:" and "Delivery location:" prompts for the customer to fill.
   - **Free-delivery nudge:** cart bar shows progress toward the ₹599 free-delivery threshold ("Add ₹120 more for FREE delivery 🎉") — values read from `site.config.json`. The cart never *computes* a delivery charge (distance is unknown); it shows the slab table as a hint and the WA message notes "Delivery: from ₹29 by distance, FREE above ₹599".
   - Edge cases (all binding): message always URL-encoded and kept < 1,800 chars (trim to item names if exceeded); `wa.me` works on iOS/Android/WhatsApp-Web desktop; cart survives reload but expires after 24 h; unavailable items can't be added; quantity bounds 1–20; totals recompute from `menu.json` prices at build time (never stored stale in localStorage — store codes+qty only); empty-cart state hides the bar.
3. **Party/bulk orders** → call-first CTA on home + contact.

## 8. Design Direction

- **Appetite-first:** food photography is the design. Warm palette (charred orange/ember red family on deep neutrals), generous whitespace, big type. Dark, warm-neutral base tends to make food photos pop — but this is decided by mockups, not by this document.
- **Photo constraint (binding input to 2a/2b):** the existing catalogue-style photos are the only photos — no reshoot. Phase 2a must analyze what they actually look like (lighting, backgrounds, crop consistency) and choose a direction that **flatters them**. If heavy glassmorphism fights the photos, say so and recommend what wins instead; uniform card treatments, tight consistent crops, and color-grading via CSS are the levers available.
- **Phase 2 delivers 2 mockup directions** as static HTML (Portfolio playbook): e.g. (A) *Ember* — dark warm glassmorphism, blurred glass cards over food imagery; (B) *Fresh Counter* — light, editorial, sharp cards, bold type. Milan picks; tokens get locked in `src/styles/global.css`. Glass/liquid effects are welcome **only where they pass contrast (WCAG AA) and don't tank scroll performance on budget Androids** — every blur is budgeted.
- **Motion spec:** scroll-reveal on cards (once, 200–350 ms, ease-out), hero parallax ≤ subtle, cart-bar spring on add, `prefers-reduced-motion` kills all of it. No motion may delay LCP.
- **Device matrix (acceptance):** 360, 390, 414, 768, 1024, 1440, **1920** px × light/dark ambient — no horizontal scroll, tap targets ≥ 44 px, sticky bar never overlaps content ends.
- **Desktop is a first-class layout, not stretched mobile (binding):** ≥ 1024 px gets its own composition — multi-column menu grid (3–4 cards), hover states (card lift, image zoom-on-hover), cart as a side panel instead of a bottom bar, hero using the horizontal canvas. Acceptance: a desktop screenshot must look *designed for* desktop, judged in the Phase 2 mockups and re-verified in Phase 6.
- **Skills to load during design/build phases:** `ui-ux-pro-max`, `frontend-design`, `theme-factory` (copy from Portfolio `.claude/skills/` in Phase 1), inspiration from 21st.dev component patterns — *patterns*, not dependencies.

## 9. SEO Plan (local-first)

- **Technical:** per-page canonical/meta/OG from a single `<Seo>` component; `@astrojs/sitemap`; `robots.txt`; OG image per page (menu items get their food photo); clean semantic HTML; image `alt` from item names; AVIF+WebP `<picture>` with explicit dimensions (zero CLS); LCP hero preloaded.
- **Structured data:** `Restaurant`+`LocalBusiness` (real facts from §3 only — **no fabricated ratings**), full `Menu`/`MenuSection`/`MenuItem` JSON-LD generated from `menu.json`, `FAQPage`, `BlogPosting`, `BreadcrumbList`.
- **Local:** `/sundargarh/` intent page; NAP identical everywhere; **owner action: claim/verify Google Business Profile**, link site ↔ GBP, add menu link + photos there — for "pizza near me" queries GBP outranks any website work, so this is called out as the #1 owner-side SEO task.
- **Content:** blog posts target long-tail local queries (already started: "pizza under 300", "late night food"); each post ends with menu CTA.
- **Migration:** old URLs (`blog-*.html`, `faq.html`, `sundargarh-770001.html`) get 1:1 replacements or `<meta http-equiv="refresh">` + canonical stubs (GitHub Pages has no server redirects) so existing indexing transfers.
- **Domain-ready:** everything reads `SITE_URL` from one config constant.

## 10. Maintainability Contract (local-LLM operations)

The repo must be operable by a small local model with no prior context:

- **`AGENTS.md`** — repo primer: where everything lives, the golden rule (`menu.json` is the menu), build/verify commands, "never touch" list.
- **`skills/`** — step-by-step task files, each self-contained, exact file paths, expected diff shape, verify step:
  `release-manager.md` + `release-recovery.md` (✅ exist — branch/merge/launch/rollback flow, binding), `update-price.md`, `add-menu-item.md`, `remove-or-disable-item.md`, `update-item-photo.md`, `update-description.md`, `update-combo.md`, `update-delivery-charges.md`, `update-hours-or-contact.md`, `update-rating.md`, `add-blog-post.md`, `verify-site.md`, `troubleshoot-build.md`.
- **Acceptance test (Phase 5 exit):** a fresh session given only `AGENTS.md` + one skill file successfully changes a price and passes the build. This was run for real on the Portfolio; do the same here.
- Zod schema is the safety net: any malformed LLM edit fails `astro check`/build with a pointed error message.

### 10.1 Context & memory system (how the model never loses the plot)

Three files, each with one job, kept current as a **binding** part of every session:

| File | Job | When it updates |
|---|---|---|
| `CLAUDE.md` | Auto-loaded by Claude Code at every session start — the constitution: read PROGRESS.md first, PRD is binding, build must be green, update PROGRESS.md at session end | Rarely; only when a rule changes |
| `PROGRESS.md` | Working memory: phase checklist, session log (done / next / open questions) | **End of every session, no exceptions** — a session that doesn't log didn't happen |
| `AGENTS.md` | Cold-start primer for any model (incl. small local LLMs): repo map, golden rules, verify commands | Phase 1 skeleton, finalized Phase 5 |

Fresh session + these three files > one long polluted session. That is the memory architecture; there is deliberately no fourth place where state lives.

### 10.2 Continuous QA layer (not just Phase 6)

- **Gate 0 (every commit):** `astro check && astro build` green — type errors and schema violations cannot land.
- **Gate 1 (every phase end):** a **fresh-eyes review subagent** (no shared context) checks the phase's exit criteria one by one against the PRD and reports pass/fail before the phase may be marked done in PROGRESS.md.
- **Gate 2 (Phases 3–6):** Playwright smoke suite (`webapp-testing` skill from Portfolio): every route 200s, no console errors, cart add→WA URL composes correctly, no horizontal scroll at the §8 matrix widths.
- **Gate 3 (Phases 5–6):** Lighthouse CI with budgets (`.lighthouserc.json`, Portfolio pattern) — perf regressions fail the build.
- **Gate 4 (Phase 6):** human pass — Milan on a real Android over 4G, plus one iOS device, tapping through the full order flow.

## 11. Build Phases

Each phase = one fresh session, seeded with this PRD + `PROGRESS.md` + only the files it needs. Update `PROGRESS.md` at session end (binding).

| # | Phase | Deliverable | Exit criteria |
|---|---|---|---|
| 0 | **Asset & data prep** (owner + chat) | Menu data audited (categories/veg flags/photos complete), best food photos identified, GBP claim started | `menu.json` passes the draft schema; hero-worthy photos chosen |
| 1 | **Architecture** | On `develop`: old site files removed (main keeps serving v1 — see branch model); Astro (latest major, per §5) + Tailwind 4 + TS strict scaffold; Zod schemas for `menu.json` + `site.config.json` (seeded with §3 values); image pipeline (JXL purged, AVIF/WebP kept); CI workflow (build check on develop, deploy job gated to main); route stubs; `AGENTS.md` + `skills/` skeletons; Portfolio design skills copied to `.claude/skills/` | `npm run build` green on develop; CI build check green; old URLs have stub replacements in the new routing |
| 2a | **Design research** | An **inspiration brief** (`design/RESEARCH.md`): web research across 21st.dev patterns, awwwards/godly-grade food & restaurant sites, top cloud-kitchen brands; what glass vs. liquid vs. editorial actually looks like on 2026 food sites; 5–8 referenced patterns with *why they convert*, screenshots/links; a recommendation | Milan reads the brief and reacts; brief committed |
| 2b | **Design system** | Tokens, font pair (self-hosted), motion spec, **2 full mockup directions** (informed by 2a) for home hero + menu card + cart bar + **desktop menu grid** | Milan picks a direction; tokens locked; contrast AA verified |
| 3 | **Build-out** | All pages per §4, WA order builder per §7 incl. every edge case, responsive per §8 matrix, motion | Every page renders real menu data at all widths, no h-scroll; cart flow works JS-on and JS-off; build green |
| 4 | **Content, copy & SEO** | All copy final, §9 fully implemented, blog migrated, fabricated-review markup verifiably gone, redirect stubs | Rich Results Test passes Restaurant/Menu/FAQ; zero placeholder text; Lighthouse SEO 100 |
| 5 | **Ops & docs** | Finished `AGENTS.md` + all 10 skill files, Umami events wired, Lighthouse CI budgets | Local-LLM acceptance test (§10) passes, run via fresh subagent |
| 6 | **QA & launch** | Device pass, a11y audit (axe + manual), link check, perf tuning; then the **one-shot launch**: tag `v1-legacy`, release PR `develop → main`, Pages source switch if needed, tag `v2.0.0` (skills/release-manager.md §7) | §1 metrics met per page (verified on preview build); Milan says "ship it"; post-merge: live URL serves v2, call + WA flow tapped through on a real phone, old-URL stubs return 200 |

## 12. Model & Effort Allocation (token-efficiency plan)

Principle (proven on Portfolio): spend expensive tokens where decisions compound; cheap tokens where the spec is already exact. Phase 1's output must make Phase 3 transcription, not invention.

| Phase | Model | Effort | Why |
|---|---|---|---|
| 1 Architecture | **Fable 5** | High | Schema + structure mistakes compound through every phase; must work from live Astro 7 docs, not training memory |
| 2a Design research | **Sonnet 5** (+ web search) | Medium | Breadth work — gather, screenshot, summarize; the *decision* happens in 2b |
| 2b Design system | **Fable 5** | Medium–High | Taste-heavy, low volume; token file is load-bearing |
| 3 Build-out | **Sonnet 5** | Standard | High volume, fully specified by Phases 1–2 |
| 4 Content & SEO | **Opus 5** | Medium | Copy voice + structured-data correctness are the conversion/SEO mechanism |
| 5 Ops & docs | **Sonnet 5** (skills) + **Haiku 4.5** (config) | Low | Mechanical; skills must be precise, config is boilerplate |
| 6 QA & launch | **Sonnet 5** | Low–Standard | Iterative small diffs |

**Session hygiene:** never carry full history across phases; one phase per session; `prompt.md` is the only launcher.

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Fabricated-rating markup already indexed → penalty risk | Remove in Phase 4; request re-crawl via Search Console |
| Heavy imagery kills 4G LCP | AVIF-first, explicit sizes, lazy below fold, hero preload, Lighthouse CI budget gate |
| Glass/blur effects jank budget Androids | Blur budget per §8; test on throttled CPU in Phase 6 |
| github.io ceiling on local SEO | GBP is the primary local lever (owner action); domain-ready constant for later |
| WA message formatting breaks on some devices | §7 edge-case list is binding acceptance, tested on real iOS + Android in Phase 6 |
| menu.json drift vs Zomato catalogue | Schema keeps Zomato field names; skills reference product codes |

## 14. Open Items (decide before their phase)

- [x] Phase 0: hero dish → Paneer Makhni Royale Pizza (2026-07-29).
- [ ] Phase 2: mockup direction A vs B.
- [ ] Phase 5: Umami account creation (owner, free).
- [ ] Post-launch: custom domain purchase (revisit); GBP verification status.
