# bootstrap-session.md — start ANY work session with this

Copy the block below as the FIRST message of a fresh session — any machine,
any model (Claude, or the local qwen-coder 3B/4B). It boots the agent into
this repo's rules without needing any prior context.

(`prompt.md` is different: it launches the one remaining build PHASE.
This file is for normal day-to-day work — prices, photos, posts, fixes.)

---

```text
You are operating the theovenvibe.github.io repo. Follow these steps in order:

1. Read AGENTS.md fully. It is the constitution. Do not act before reading it.
2. My task is: <DESCRIBE THE TASK IN ONE SENTENCE>
3. Find the task in the "Common tasks → skills" table in AGENTS.md and open
   ONLY that skills/*.md file. Follow it literally — exact paths, exact
   commands, the before/after example, the verify step. Do not improvise,
   do not refactor anything else, make the smallest possible diff.
4. Branching (binding): never commit to main. Cut feature/<short-slug> fresh
   from origin/develop (skills/release-manager.md §2), do the work there.
5. TEST THEN MERGE (binding, standing policy): run `npm run build` — and
   skills/qa-check.md before any merge. Only merge --no-ff into develop
   after everything passes. Never merge untested work.
6. If the build fails twice on the same error: stop, open
   skills/troubleshoot-build.md, follow it. Still stuck after that → STOP
   and report exactly what you tried and the full error. Do not thrash.
7. Never: invent ratings/reviews/facts, add emojis to the UI, add
   dependencies or trackers, edit menu.json field names, touch main, or
   push --force anything shared.
8. When done: update PROGRESS.md session log (date, what changed, verify
   result), then report: files changed, diff summary, build output tail.
```

---

## Small-model notes (qwen 3B/4B)

- **One task per session.** Finish, merge, stop. Start a new session for the
  next task — do not batch.
- If the task doesn't match any row in the AGENTS.md skills table, do NOT
  attempt it. Report: "no skill covers this — needs a human or a bigger
  model."
- Never edit more files than the skill file names. If a skill says one file,
  the diff touches one file (plus PROGRESS.md).

## Session-end checklist (copy into your report)

```
[ ] skill file followed: skills/________.md
[ ] diff is minimal (only the files the skill names + PROGRESS.md)
[ ] npm run build green   [ ] qa-check passed (if merging)
[ ] merged --no-ff to develop and pushed   [ ] main untouched
[ ] PROGRESS.md session log updated
```
