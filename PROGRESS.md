# PROGRESS

## Status: ✅ Phase 1 COMPLETE. Phase 2a research brief written (2026-07-29) — awaiting Milan's reaction before Phase 2b. Next: Milan reviews `design/RESEARCH.md`, then Phase 2b — Design system. Set `/model` to Fable 5, paste prompt.md into a fresh session.

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
- [x] **Phase 2a — Design research** (Sonnet 5 + web search, medium) — brief committed 2026-07-29
  - Exit: inspiration brief `design/RESEARCH.md` committed (site patterns + **logo/brand research** + photo analysis); Milan has reacted to it
  - ⚠️ **Open:** "Milan has reacted" exit criterion is NOT yet satisfied — brief is written and committed, but owner has not yet reviewed/reacted. Do not treat 2a as fully closed until Milan responds; surface the brief to him before starting 2b.
- [ ] **Phase 2b — Design system** (Fable 5, medium-high)
  - Exit: Milan picks mockup direction A/B incl. **logo concept + favicon set** (desktop menu grid in mockups); tokens locked; contrast AA verified; favicon crisp at 16–48px
  - Scope note (owner, 2026-07-29): logo redesign in scope; food/item photos untouchable; all other imagery (blog headers, OG, illustrations) newly created
- [ ] **Phase 3 — Build-out** (Sonnet 5, standard)
  - Exit: all pages, all widths, no h-scroll; WA cart works JS-on and JS-off; build green
- [ ] **Phase 4 — Content, copy & SEO** (Opus 5, medium)
  - Exit: Rich Results Test passes; fabricated reviews gone; zero placeholders; Lighthouse SEO 100
- [ ] **Phase 5 — Ops & docs** (Sonnet 5 + Haiku 4.5, low)
  - Exit: local-LLM acceptance test passes via fresh subagent
- [ ] **Phase 6 — QA & launch** (Sonnet 5, low-standard)
  - Exit: PRD §1 metrics met per page; redirects verified in prod; GBP checklist handed to owner

## Session log

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
- **Open — binding:** Phase 2a's exit criterion is "Milan has reacted" to the brief. That has **not** happened yet — this session only produced and committed the brief. Do not start Phase 2b until Milan has read `design/RESEARCH.md` and responded (direction preference, logo preference, any corrections to the photo/logo critique).
- Next: **Milan reviews `design/RESEARCH.md`**, then **Phase 2b — Design system** (Fable 5, medium-high effort). Fresh session, paste prompt.md.
