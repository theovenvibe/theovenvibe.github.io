# Skill: deploy-cicd

How the CI/CD workflow (`.github/workflows/deploy.yml`) actually works,
how to read its output, and what to do if it looks wrong.

## 1. What the workflow does, in one sentence

**It builds on every push to any branch, but only deploys the live site
when that push lands on `main`.** During the v2 rebuild, `main` is
frozen (skills/release-manager.md), so the deploy job simply never runs
— that is correct, expected, and nothing to fix.

## 2. The two jobs, read straight from the file

Open `.github/workflows/deploy.yml`. It has exactly two jobs:

- **`build`** — runs on `push` to `main`, `develop`, any `feature/**`, any
  `hotfix/**`, and on pull requests into `main`/`develop`. Steps:
  checkout → Node 24 → `npm ci` → `npm run build` (this is the exact same
  `astro check && astro build` you run locally). If this fails on GitHub,
  it will have failed locally too first — see
  `skills/troubleshoot-build.md`.
- **`deploy`** — only runs `if: github.ref == 'refs/heads/main'`. It takes
  the `build` job's output and publishes it to GitHub Pages.

## 3. Reading the Actions tab / `gh run list`

```bash
gh run list --branch develop --limit 5
gh run list --branch feature/your-branch-name --limit 5
gh run list --branch main --limit 5
```

For any branch that isn't `main`, a healthy run looks like:
```
✓  ci: rename workflow ...   deploy   feature/phase-5-ops   push   ...
```
Open it (`gh run view <run-id>`) and you'll see the `build` job green and
the `deploy` job shown as **skipped** — that line literally reads
`deploy: skipping` in the GitHub UI. **This is normal and correct on
every branch except `main`.** Do not try to "fix" a skipped deploy job on
`develop` or a `feature/*` branch — there is nothing to fix; it is
designed to be gated to `main` only (PRD §5).

## 4. If the `build` job is red

This means the same `npm run build` that fails locally is failing in CI
too — it is not a CI-specific problem. Reproduce locally first:
```bash
npm ci        # match CI's clean-install exactly, not just npm install
npm run build
```
Then follow `skills/troubleshoot-build.md`. A build that passes locally
but fails in CI almost always means a file was edited but not
`git add`ed/committed (CI only sees what was pushed) — check
`git status --short` for anything still uncommitted.

## 5. The launch-day Pages source switch (read before Phase 6, do not do this now)

Right now, GitHub Pages is configured to deploy from a branch (the old
v1 setup: Settings → Pages → Source = "Deploy from a branch", `main` /
`root`). The `deploy` job in this workflow uses the newer
`actions/deploy-pages` mechanism, which requires **Settings → Pages →
Source = "GitHub Actions"** instead.

**Until the v2 launch, do NOT switch this setting** — `main` never
receives a push before launch (it's frozen), so the workflow's `deploy`
job never runs regardless of which source is configured, and v1 keeps
serving normally either way.

At launch (`skills/release-manager.md` §7, the one-shot `develop → main`
merge), switch **Settings → Pages → Source → GitHub Actions** as part of
that same step, then verify:
```bash
gh run list --branch main --limit 1
```
shows the `deploy` job green, and the live URL serves the NEW site.

## 6. If a bad deploy somehow reaches `main` after launch

Do not touch this workflow file to "roll back" — the fix is a `git
revert` on `main`, not a CI change. Follow
`skills/release-recovery.md` §R1 (post-launch rollback).

## 7. Editing this workflow file itself

If you ever need to change `.github/workflows/deploy.yml` (rare — e.g.
bumping the Node version), treat it exactly like any other code change:
feature branch off `develop`, verify locally with `npm ci && npm run
build`, commit, merge per `skills/release-manager.md`. A workflow change
cannot be "verified" by GitHub alone — always reproduce the underlying
build command locally first.
