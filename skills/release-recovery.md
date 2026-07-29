# Skill: release-recovery

What to do when the normal flow (skills/release-manager.md) goes wrong:
edge cases (§E) and rollback (§R). Golden rule for this repo during the
v2 rebuild: **main is sacred** — it serves the live v1 site. Recovery
never force-pushes main or develop; fix forward on branches.

## §E — Edge cases

### E1. Dirty working tree when you need to start
Never carry unrelated dirty files onto a new branch. Finish/ship the
other work first, or stash it — full stash recipe: §G6.

### E2. develop moved while your feature branch was open (the ONE rebase)
```bash
git fetch origin develop
git rebase origin/develop        # conflicts: edit → git add <f> → git rebase --continue
                                 # bail out cleanly: git rebase --abort
npm run build                    # ALWAYS re-verify after a rebase
git push --force-with-lease      # NEVER plain --force
```
Never rebase main, develop, or merged history. `--force-with-lease` only
on your own unmerged feature branch.

### E3. Merge to develop conflicts
Abort the merge (`git merge --abort`), rebase the feature branch onto
origin/develop per E2, then redo release-manager §5.

### E4. Build fails on develop after a merge
The merged state is broken even though the branch built. Fix FORWARD on
develop with a small `fix:` commit (or a fresh feature branch if it's
big). Never reset --hard a pushed develop. For reading the actual error
(Zod field errors, Astro/TS errors, JSON syntax errors) → the full guide
is `skills/troubleshoot-build.md`.

### E5. Accidental commit directly on develop (should've been a branch)
Not pushed yet: `git checkout -b feature/<slug>` (commit comes along) →
`git checkout develop && git reset --hard origin/develop` → merge
normally. Already pushed: leave it — history is history; note it in
PROGRESS.md and move on.

### E6. Accidental commit or push to main during the rebuild window
- Not pushed: `git checkout -b feature/<slug>` → `git checkout main &&
  git reset --hard origin/main`. Crisis averted.
- **Pushed:** the live site may have redeployed. Immediately
  `git revert <sha>` on main and push (revert = forward fix, safe), then
  verify the live URL serves v1 again. Log it in PROGRESS.md.

### E7. Stray preview server / wrong port
`astro preview` silently falls back 4321→4322, so URLs may point at a
stale server. `lsof -ti :4321 | xargs kill` first.

### E8. Amending
`--amend` only before pushing, or on your own feature branch +
`--force-with-lease`. Never amend develop/main history.

### E9. localStorage cart bugs reported mid-QA
The cart stores only `{code, qty}` (PRD §7) — prices always recompute
from menu.json at build. If a schema change renames codes, bump the
cart's storage key (`ovencart-v2` → `-v3`) instead of migrating state.

## §G — Git: which command for which situation

A decision guide for the git operations not already covered step-by-step
above. Written for a small/local model working alone, so every entry
gives ONE blessed path, not a menu of options. Jump straight to §G9 for
the one-screen symptom → tool → section lookup table.

### G1. Merge vs rebase — the one rule

- **Rebase** only your OWN feature branch, only when it's unpushed or
  pushed-but-not-yet-merged, only onto `origin/develop` (never onto
  `main`). This is "catch my branch up to the latest develop." Exact
  commands: §E2.
- **Merge** (`--no-ff`) is the ONLY way a feature branch joins `develop`,
  and the only way `develop` joins `main`. Never rebase a branch that's
  already merged, and never rebase `develop` or `main` themselves.
- If you're not sure which one applies: you are almost certainly in the
  "rebase my own branch" case (§E2) or the "merge my finished branch"
  case (skills/release-manager.md §5) — there is no third case in this
  repo's workflow.

### G2. Resolving a merge/rebase conflict, step by step

Whether it happened during `git merge` or `git rebase`, the recipe is the
same:

1. `git status` — lists every file with a conflict under "Unmerged
   paths".
2. Open each conflicted file. Find the conflict markers:
   ```
   <<<<<<< HEAD (or the commit hash, during a rebase)
   ...content from the side you're merging/rebasing INTO...
   =======
   ...content from the side you're merging/rebasing FROM...
   >>>>>>> feature/some-branch
   ```
3. Edit the file by hand to keep the correct combined result, then DELETE
   the three marker lines (`<<<<<<<`, `=======`, `>>>>>>>`) themselves —
   they are not valid JSON/code and will break the build if left in.
4. `git add <the file you just fixed>` for each resolved file.
5. Continue the operation you were in:
   - mid-merge: `git commit` (git pre-fills a merge commit message)
   - mid-rebase: `git rebase --continue`
6. `npm run build` — ALWAYS re-verify after resolving a conflict, even if
   the conflict looked trivial.

**When unsure, abort and start over instead of guessing:**
```bash
git merge --abort      # mid-merge
git rebase --abort     # mid-rebase
```
Then re-cut the branch fresh from `origin/develop`
(skills/release-manager.md §2) and redo the smaller amount of work again
cleanly, rather than fighting a conflict you don't understand. This is
always safe — nothing is lost except your local uncommitted conflict
resolution attempt.

### G3. git bisect — "this worked before, broke sometime since"

Use when a bug appeared somewhere in a range of commits and you don't
know which one caused it. Needs one known-GOOD point and one known-BAD
point (usually: current `HEAD` is bad, some older tag or commit was good).

```bash
git bisect start
git bisect bad HEAD                    # current state is broken
git bisect good <known-good-sha-or-tag>  # e.g. a tag, or an old commit sha

# git checks out a midpoint commit automatically. At each stop:
npm run build                          # the test
# if the bug is something npm run build itself would fail on:
git bisect run npm run build           # fully automated — jumps straight to the answer

# otherwise (a visual/content bug the build wouldn't catch), test manually
# at each stop, then tell bisect what you found:
git bisect good     # this commit is fine
# — or —
git bisect bad      # this commit already has the bug

# repeat until git prints "<sha> is the first bad commit"
git bisect reset     # ALWAYS run this — returns you to your original branch/commit
```
Never skip `git bisect reset` — until you run it, you're on a detached
HEAD in the middle of the bisect, not on your actual branch.

### G4. git cherry-pick — pulling one commit off a mistaken branch

Use when a commit landed on the wrong branch (e.g. committed directly to
`develop` when it should've been a feature branch, or a fix was made on
an abandoned branch) and you need just that ONE commit somewhere else.

```bash
git log <branch-with-the-commit> --oneline -5   # find the sha you need
git checkout <branch-you-want-it-on>
git cherry-pick <sha>
# conflict? resolve exactly like §G2, then:
git cherry-pick --continue
# changed your mind partway through:
git cherry-pick --abort
npm run build          # always re-verify after a cherry-pick
```

### G5. git revert vs git reset — the one rule

- **Anything already pushed** (to `develop`, to `main`, or to any branch
  someone else might have fetched) → **`git revert`**. It creates a NEW
  commit that undoes the old one — history stays intact, safe to push.
  ```bash
  git revert <bad-sha>
  git push
  ```
- **Only exists on your machine, never pushed anywhere** → `git reset
  --hard <good-sha>` is fine — you're not rewriting anyone else's view of
  history because nobody else has seen it yet.
- **Never `git reset --hard` on `develop` or `main`**, pushed or not —
  those branches are never "only on your machine." If you're tempted to
  reset one of them, you want `git revert` instead, or see §R2 (restoring
  `develop` to a known-good point via revert, not reset).

### G6. git stash — parking dirty work

Use when you have uncommitted changes but need a clean working tree right
now (starting a new branch, pulling latest, etc.) and you're not ready to
commit or throw away what you have.

```bash
git stash push -m "wip: <short reason>"   # always add a message, you WILL forget otherwise
# ... switch branches, pull, whatever you needed a clean tree for ...
git stash list                             # see everything you've stashed
git stash pop                              # re-apply the most recent stash + remove it from the list
```
If `git stash pop` conflicts (rare — means the tree changed underneath
your stashed edits), resolve exactly like §G2, then `git stash drop` to
clear the stash entry manually (pop only auto-drops on a clean apply).
Never stash-and-forget across a branch switch — a forgotten stash is
silently invisible work; `git stash list` is safe to run any time you're
unsure whether you have one pending.

### G7. git reflog — "I lost a commit"

Use when a commit seems to have vanished (a bad `reset --hard`, a
force-push you didn't mean, a rebase that ate something).

```bash
git reflog                              # every place HEAD has pointed, newest first
# find the commit you lost by its message/sha in the list
git checkout -b recovery/<slug> <sha>   # rescue it onto a brand-new branch
npm run build                           # verify before doing anything else with it
```
`git reflog` is local-only and covers roughly the last ~90 days of HEAD
movements on this machine — it will not help recover something lost on a
different machine, and it will not find a commit that was never checked
out on this machine in the first place.

### G8. git restore — discarding or unstaging ONE file

```bash
# throw away uncommitted edits to one file, back to the last commit
git restore <file>

# keep the edits, just remove the file from what the next commit will include
git restore --staged <file>
```
`git restore <file>` is NOT recoverable if the change was never committed
or stashed anywhere — read the file's current diff (`git diff <file>`)
before running it, so you know what you're about to lose.

### G9. One-screen decision table

| Symptom | Tool | Section |
|---|---|---|
| My feature branch needs the latest `develop` | rebase (own branch only) | §G1, §E2 |
| My feature branch is done, ready to join `develop` | merge `--no-ff` | skills/release-manager.md §5 |
| Merge/rebase shows `<<<<<<<` conflict markers | resolve conflict | §G2 |
| Conflict looks confusing / not sure how to resolve | abort, re-cut the branch | §G2 |
| "This worked last week, broke sometime since" | `git bisect` | §G3 |
| Need one commit that landed on the wrong branch | `git cherry-pick` | §G4 |
| Bad commit already pushed to `develop`/`main` | `git revert` | §G5, §R1 |
| Bad commit, local-only, never pushed | `git reset --hard` | §G5 |
| Dirty files in the way of starting new work | `git stash` | §G6, §E1 |
| "I deleted/lost a commit" | `git reflog` | §G7 |
| Want to undo edits to just one file | `git restore` | §G8 |
| Live site broken right after launch | rollback | §R1 |
| `develop` is a mess before launch, want a clean slate | restore to known-good | §R2 |
| Dirty tree, wrong branch entirely | stash → branch → work → pop | §E1, §G6 |

## §R — Rollback

### R1. After launch: v2 is live and something is badly wrong
```bash
git checkout -b hotfix/rollback-v2 origin/main
git revert -m 1 <launch-merge-sha>     # -m 1 keeps main's side (= v1)
git push -u origin hotfix/rollback-v2
gh pr create --base main --head hotfix/rollback-v2 \
  --title "revert: roll back v2 launch" --body "Restores v1 — <why>."
# merge → Pages redeploys v1. v2 fixes continue on develop; relaunch via
# release-manager §7 (revert-the-revert on a fresh branch, then merge).
```
⚠️ If launch included switching the Pages source (branch → Actions),
switch it BACK in Settings → Pages too, or the revert won't serve.

### R2. Before launch: develop is a mess, want a known-good point
```bash
git log origin/develop --merges --oneline -10   # find last good merge
git checkout -b feature/restore-good origin/develop
git revert --no-commit <bad-sha>..HEAD          # or git checkout <good-sha> -- .
npm run build
git commit -m "revert: restore develop to <good-sha> state"
# merge to develop per release-manager §5
```
Never delete or force-move develop — revert forward.

### R3. Emergency (live site broken AND git state confusing)
Pages keeps serving the last successful deploy — the site rarely goes
fully dark. Breathe. Identify what main last deployed
(`gh run list --branch main --limit 3`), then fix via the smallest
possible hotfix PR (release-manager §8). No force-push escape hatches.

### After any rollback
- PROGRESS.md entry: what, why, evidence, next step.
- Never delete/move existing tags — tags are history. `v1-legacy` must
  survive forever; it's the archived old site.
