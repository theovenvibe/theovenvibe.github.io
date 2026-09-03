# CLAUDE.md

- This repo is **theovenvibe.github.io** — The Oven Vibe cloud kitchen (Sundargarh, Odisha) digital menu & lead-gen site. Rebuild in progress per `PRD.md`.
- **Source of truth:** `PRD.md` (binding — do not re-litigate its recorded decisions). `menu.json` is the menu; it mirrors the Zomato catalogue and its field names must never be restructured away.
- **At session start:** read `PROGRESS.md` first. **At session end:** update `PROGRESS.md` (phase state + session log) before finishing — a session that doesn't log didn't happen.
- **Work is phased** (PRD §11, one phase per fresh session, launched via `prompt.md`). Never start the next phase in the same session.
- **Branching (binding, post-launch):** `main` = **production**. GitHub Pages serves it at theovenvibe.com, and `.github/workflows/deploy.yml` deploys on every push to it. `develop` = integration, permanent. All work: `feature/<slug>` cut fresh from `origin/develop` → verify → `merge --no-ff` into `develop`; release by merging `develop` → `main`. Both merges are gated by `npm run build` + `skills/qa-check.md` — see `skills/release-manager.md` §8.1. When things break: `skills/release-recovery.md`.
  > The v2-rebuild rule that used to live on this line said `main` was FROZEN and would receive `develop` exactly once. That window closed when v3.0.0 launched on 2026-07-30 (`skills/release-manager.md` §8), but this file still said "frozen" on 2026-09-03 and stopped a release until the skill was read. `main` has taken merges routinely since launch.
- **Never guess an element id (binding):** `docs/UI-SELECTORS.md` lists every id in the site; regenerate with `npm run selectors` after renaming one. Three sessions have lost time to invented selectors, and one of them (`#nameInput` instead of `#custName`) would have shipped alerts with no customer name in them — a wrong id fails silently in a browser, so a passing build proves nothing.
- **Verification (binding):** `npm run build` (`astro check && astro build`) must pass before any commit. Conventional commits, small and single-purpose.
- **Astro version:** latest stable major (7.x+). Model training data lags Astro releases — when touching config/APIs, verify against live docs, not memory.
- **Never touch:** `static/images/**` originals (optimize copies, don't overwrite), business facts in PRD §3 (owner-supplied only), and never add fabricated ratings/reviews to structured data (PRD §3 warning).
- **QA gates** (PRD §10.2): fresh-eyes subagent verifies exit criteria before any phase is marked done.
