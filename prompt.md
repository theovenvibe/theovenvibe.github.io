# One-Prompt Launcher — The Oven Vibe rebuild

Copy the block below into a **fresh Claude Code session** in this repo, once per phase. It self-locates the next phase, so the same prompt works from Phase 1 through Phase 6.

> **Before pasting:** set the session model per `PRD.md §12` for the upcoming phase
> (`/model` — Phase 1–2: Fable 5 · Phase 3, 5, 6: Sonnet 5 · Phase 4: Opus 5).

---

```text
Read PRD.md and PROGRESS.md in this repo. PRD.md is binding — do not re-litigate
decisions recorded in it.

Execute exactly ONE phase: the first unchecked phase in PROGRESS.md.

Rules for this session:
1. Load only the files that phase needs — keep the context lean (PRD §12 session hygiene).
2. Load the skills the phase calls for (PRD §8: ui-ux-pro-max / frontend-design /
   theme-factory live in .claude/skills/ after Phase 1 copies them from
   ~/personal/Portfolio/.claude/skills/).
3. Work through the phase's deliverables from PRD §11. Every edge case listed in
   PRD §7 and §9 for this phase's scope is acceptance criteria, not a suggestion.
4. `npm run build` (astro check + build) must be green before any commit.
   Conventional commits, small and single-purpose.
5. Branching per skills/release-manager.md (binding): main is FROZEN (live v1
   site) — work on feature/<slug> cut fresh from origin/develop, merge --no-ff
   back into develop when verified. Never touch main until the Phase 6 launch.
6. If a deliverable needs an owner decision (PRD §14), finish everything that
   doesn't depend on it, then stop and ask me — do not guess brand/taste calls.
7. Anything version- or API-sensitive (Astro config, integrations, Tailwind):
   verify against live docs / `npm view`, never from training memory (PRD §5).
8. Before marking the phase done, run the QA gates that apply to it (PRD §10.2),
   including the fresh-eyes review subagent checking exit criteria one by one.
9. At session end: check the phase off in PROGRESS.md with date + a short log of
   what was done, what's next, and any open questions. Do this even if the phase
   is only partially complete.
10. Do NOT start the next phase. Tell me which model to set for it (PRD §12) and stop.

Verify the phase's exit criteria from PRD §11 explicitly, one by one, before
declaring the phase done.
```

---

**Phase 0 note:** Phase 0 is owner + chat work (menu data audit, photo picks, GBP claim) — run it conversationally, no code session needed.

**Recovery:** if a phase went sideways, don't patch a polluted session — note state in `PROGRESS.md`, start fresh with this same prompt.
