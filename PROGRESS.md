# PROGRESS

## Status: ✅ Phase 0 COMPLETE (2026-07-29). Next: Phase 1 — Architecture. Set `/model` to Fable 5, paste prompt.md into a fresh session.

## Phase checklist (from PRD §11)

- [x] **Phase 0 — Asset & data prep** (owner + chat) — DONE 2026-07-29
  - Menu audit: 32 items / 7 categories / 5 combos / 6 add-ons — **0 issues** (all have category, AVIF+WebP image, valid price/status; combo refs valid)
  - Hero dish: **Paneer Makhni Royale Pizza** (752649876, ₹199, image verified)
  - GBP: claimed & verified, **4.9★ / 16 reviews**, entity `/g/11zj4x092l` (link resolves ✓)
  - Delivery slabs: ₹29 (0–2 km) / ₹59 (2–4 km) / ₹99 (4–8 km), FREE > ₹599 — recorded in PRD §3, to be seeded into site.config.json in Phase 1
- [ ] **Phase 1 — Architecture** (Fable 5, high effort)
  - Exit: build green; stub live on theovenvibe.github.io; old URLs stubbed; legacy branch archived
- [ ] **Phase 2a — Design research** (Sonnet 5 + web search, medium)
  - Exit: inspiration brief `design/RESEARCH.md` committed; Milan has reacted to it
- [ ] **Phase 2b — Design system** (Fable 5, medium-high)
  - Exit: Milan picks mockup direction A/B (incl. desktop menu grid); tokens locked; contrast AA verified
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
