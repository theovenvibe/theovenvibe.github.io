# One-Prompt Launcher — The Oven Vibe rebuild

Phases 1–5 are done (see `PROGRESS.md`). The only phase left is **Phase 6
— QA & launch**, the one-shot v2 (tag `v3.0.0`) launch. Copy the block
below into a **fresh Claude Code session** in this repo to run it.

> **Before pasting:** set the session model to **Sonnet 5**, low–standard
> effort (PRD §12, Phase 6 row).

---

```text
Read PRD.md and PROGRESS.md in this repo. PRD.md is binding — do not re-litigate
decisions recorded in it. PROGRESS.md shows Phases 1–5 done; execute Phase 6
(PRD §11) — the final phase.

Rules for this session:
1. Load only the files this phase needs — keep the context lean (PRD §12 session
   hygiene).
2. Work through Phase 6's deliverables from PRD §11: device/a11y/perf pass, link
   check, then the one-shot launch (skills/release-manager.md §7 — launch tag is
   v3.0.0, a major version, per the owner decision recorded in that skill).
3. `npm run build` (astro check + build) must be green before any commit.
   Conventional commits, small and single-purpose. Run skills/qa-check.md before
   any merge.
4. Branching per skills/release-manager.md (binding until the launch merge): main
   is FROZEN (live v1 site) — work on feature/<slug> cut fresh from origin/develop,
   merge --no-ff back into develop when verified. The ONE exception this phase is
   the launch itself: the develop -> main release PR in skills/release-manager.md
   §7 — do not touch main any other way.
5. If a deliverable needs an owner decision, finish everything that doesn't depend
   on it, then stop and ask Milan — do not guess. The "ship it" precondition for
   THIS v3.0.0 launch is already satisfied (Milan said it 2026-07-30, recorded in
   skills/release-manager.md §7) — do NOT re-ask for it. Still verify every
   OBJECTIVE gate first (build green, skills/qa-check.md passed, PRD §10.2 QA
   gates 0-4 green) before opening the release PR — the owner sign-off covers the
   decision to launch, not a waiver of the technical checks.
6. Anything version- or API-sensitive (Astro config, integrations, Tailwind, GitHub
   Pages settings): verify against live docs, never from training memory.
7. Before marking Phase 6 done, run the QA gates that apply to it (PRD §10.2),
   including the fresh-eyes review subagent checking exit criteria one by one.
8. Post-merge (skills/release-manager.md §7 "Post-merge" checklist): verify the
   Pages source switch if needed, confirm the live URL serves v3.0.0, tap through
   the call + WhatsApp order flow on a real phone, spot-check the old-URL stubs
   return 200.
9. At session end: check Phase 6 off in PROGRESS.md with date + a short log of
   what was done and any open questions.

Verify Phase 6's exit criteria from PRD §11 explicitly, one by one, before
declaring the phase — and the whole PRD — done.
```

---

**After Phase 6 ships:** this file has no more phases to launch. The
branch model unfreezes (skills/release-manager.md §8) — future work is
ordinary `feature/<slug>` branches off `develop`, released to `main`
whenever a batch is ready, per the same skill file. There's no need to
run this prompt again; day-to-day edits should start from `AGENTS.md` and
the matching `skills/*.md` file instead.

**Recovery:** if Phase 6 goes sideways, don't patch a polluted session —
note state in `PROGRESS.md`, start fresh with this same prompt.
