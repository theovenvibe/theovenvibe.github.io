# CLAUDE.md

- This repo is **theovenvibe.github.io** — The Oven Vibe cloud kitchen (Sundargarh, Odisha) digital menu & lead-gen site. Rebuild in progress per `PRD.md`.
- **Source of truth:** `PRD.md` (binding — do not re-litigate its recorded decisions). `menu.json` is the menu; it mirrors the Zomato catalogue and its field names must never be restructured away.
- **At session start:** read `PROGRESS.md` first. **At session end:** update `PROGRESS.md` (phase state + session log) before finishing — a session that doesn't log didn't happen.
- **Work is phased** (PRD §11, one phase per fresh session, launched via `prompt.md`). Never start the next phase in the same session.
- **Branching (binding, v2 rebuild period):** `main` = live v1 site, **FROZEN** — never commit or push to it; it receives `develop` exactly once, at the final v2 launch (skills/release-manager.md §7). All work: `feature/<slug>` cut fresh from `origin/develop` → verify → `merge --no-ff` into `develop`. Full flow: `skills/release-manager.md`; when things break: `skills/release-recovery.md`.
- **Verification (binding):** `npm run build` (`astro check && astro build`) must pass before any commit. Conventional commits, small and single-purpose.
- **Astro version:** latest stable major (7.x+). Model training data lags Astro releases — when touching config/APIs, verify against live docs, not memory.
- **Never touch:** `static/images/**` originals (optimize copies, don't overwrite), business facts in PRD §3 (owner-supplied only), and never add fabricated ratings/reviews to structured data (PRD §3 warning).
- **QA gates** (PRD §10.2): fresh-eyes subagent verifies exit criteria before any phase is marked done.
