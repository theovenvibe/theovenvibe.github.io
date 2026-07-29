# Skill: release-recovery

What to do when the normal flow (skills/release-manager.md) goes wrong:
edge cases (§E) and rollback (§R). Golden rule for this repo during the
v2 rebuild: **main is sacred** — it serves the live v1 site. Recovery
never force-pushes main or develop; fix forward on branches.

## §E — Edge cases

### E1. Dirty working tree when you need to start
Never carry unrelated dirty files onto a new branch. Finish/ship the
other work first, or `git stash push -m "wip: <why>"` → branch → work →
later `git stash pop`. Read any dirty file you're about to overwrite.

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
big). Never reset --hard a pushed develop. Build errors themselves →
Zod message says exactly which menu.json/site.config.json field is bad;
Astro/TS errors: read the first error, not the last.

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
