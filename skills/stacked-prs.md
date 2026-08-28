# Skill: stacked-prs

**Binding from 2026-08-28.** Multi-part work ships as a **stack** of pull
requests, not one branch carrying everything. Owner's instruction, and it
replaces the single-`feature/*`-branch step in `skills/release-manager.md` §2
whenever a task has more than one logical part. Everything else in
release-manager still applies — the verify gates, the owner-approval gate, and
`develop` → `main` being the only thing that goes live.

## Why

On 2026-08-28 one branch carried a centred notification dialog, a centred
install dialog, and first-touch source capture. Three unrelated things in one
diff. Nothing went wrong, but nothing could be reviewed or reverted
separately either — and if the source capture had been wrong, backing it out
would have meant unpicking it from two UI changes it had nothing to do with.

A stack keeps each part its own PR with its own diff, in order, so each can be
read, approved and reverted on its own.

## Setup (already done on this machine)

```bash
gh extension install github/gh-stack   # the CLI
```

The agent skill lives at `~/.claude/skills/gh-stack/` — copied from the repo
because `gh skill install` needs a real terminal and silently does nothing
when an agent runs it. Re-copy it the same way after an update:

```bash
git clone --depth 1 https://github.com/github/gh-stack /tmp/ghstack
cp -r /tmp/ghstack/skills/gh-stack ~/.claude/skills/
```

## The flow

Trunk is `develop` in this repo, `main` in the backend repo — the same base
`skills/release-manager.md` names.

```bash
git status --short                 # MUST be clean
git fetch origin develop --quiet
git checkout develop && git pull --ff-only origin develop

gh stack init                      # names the first branch, trunk = develop
# ... first logical part only ...
npm run build                      # green before every commit, no exceptions
git add <exact files> && git commit -m "feat(scope): first part"

gh stack add <second-slug>         # next part, branched on top of the first
# ... second part ...
npm run build
git add <exact files> && git commit -m "feat(scope): second part"

gh stack push                      # push every branch
gh stack submit                    # open the PRs, linked as a stack
gh stack view                      # check the whole chain before asking for review
```

Each PR targets the branch below it, so a reviewer sees **only** that layer's
diff.

## Rules for this project

1. **One concern per branch.** If a branch's commit message needs the word
   "and", it is two branches.
2. **`npm run build` green before every commit**, on every branch in the
   stack — not just the top one. A red branch in the middle means every PR
   above it is unreviewable.
3. **`skills/qa-check.md` before submitting**, per release-manager §8.1.
4. **Merge bottom-up.** `gh stack merge` handles the order; never merge a
   middle PR by hand, it orphans everything above it.
5. **After merging, re-sync** — `gh stack sync` — before starting anything
   new, or the next stack branches off a stale trunk.
6. **A genuine one-part change does not need a stack.** A price edit or a
   single copy fix is still a plain `feature/<slug>`. The stack is for work
   that has parts.

## Watch out

- **The trunk drifting.** `develop` was once 126 commits behind `main`, and a
  stack cut from a stale trunk rebases badly later. Check
  `git rev-list --count origin/develop..origin/main` is `0` before
  `gh stack init`.
- **Rebasing after a review.** Changing a lower branch means every branch above
  it needs `gh stack rebase`. Do that immediately, not at merge time.
- **The backend repo has no `develop`.** Its trunk is `main`, and merges there
  deploy the Worker on the next `npx wrangler deploy` — so the same "one
  concern per branch" rule matters more there, not less.

Full command reference: `~/.claude/skills/gh-stack/references/commands.md`.
When a stack goes wrong: `references/troubleshooting.md`, then this repo's
`skills/release-recovery.md`.
