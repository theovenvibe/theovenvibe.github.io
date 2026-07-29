# Skill: release-manager

The version-control workflow for this repo: requirement → branch → verify
→ commit → merge to develop. When something goes WRONG (conflicts, broken
build, rollback) switch to `skills/release-recovery.md`.
Commands assume repo root; `gh` CLI authenticated as the repo owner.

## 1. Branch model (binding — v2 rebuild period)

```
main      = PRODUCTION = the live v1 site at theovenvibe.github.io.
            FROZEN during the v2 rebuild. Nobody commits here.
            Receives develop EXACTLY ONCE — the final v2 launch (§7).
            (Exception: emergency v1 hotfix, §8.)
develop   = integration. ALL v2 work lands here. CI builds it; nothing
            deploys from it. Permanent branch — never delete.
feature/* = work branches, cut FRESH from origin/develop, one purpose
            each, deleted after merge. Never reuse a merged branch.
hotfix/*  = urgent LIVE-SITE (v1) fixes only, cut from origin/main (§8).
```

Why frozen main: Pages serves main, deploys are slow, and the timeline is
1–2 days — we deploy ONCE, at the end, not per-feature. Customers keep
seeing the working v1 site the whole time.

## 2. Cut the branch (always from the fresh remote ref)

```bash
git status --short                 # MUST be clean (dirty? → recovery §E1)
git fetch origin develop --quiet
git checkout -b feature/<short-kebab-slug> origin/develop
```

## 3. Do the work, then verify (hard gates)

1. `npm run build` (= `astro check && astro build`) must pass before ANY
   commit — no exceptions. A Zod error from menu.json / site.config.json
   is a real defect: fix the data or the schema, never bypass.
2. **Owner approval gate:** user-visible design/copy changes need Milan's
   OK on a local preview (`npm run preview`) or screenshot BEFORE merging
   to develop. Pushing the feature branch is fine; merging is not.
3. Never commit fabricated ratings/reviews (PRD §3) or hard-coded
   business values that belong in site.config.json (PRD §6).

## 4. Commit

```bash
git add <exact files> PROGRESS.md  # never `git add .`; log per CLAUDE.md
git commit -m "feat(scope): what changed, imperative, <72 chars"
git push -u origin feature/<slug>
```

Conventional commits (`feat:` `fix:` `docs:` `chore:` `refactor:` `ci:`),
small and single-purpose.

## 5. Merge feature → develop

Solo repo, no branch protection, tight timeline → local merge is the
default; open a PR instead only when Milan wants to review a diff.

```bash
git fetch origin develop
git checkout develop && git pull --ff-only origin develop
git merge --no-ff feature/<slug>   # keep the feature boundary in history
npm run build                       # verify the MERGED state too
git push origin develop
git branch -d feature/<slug> && git push origin --delete feature/<slug>
```

If develop moved while you worked and the merge conflicts → recovery §E2.

## 6. CI on develop

Pushes to develop run the build check in Actions (once Phase 1 lands the
workflow). Deploy job is gated to main — "deploy: skipping" on develop is
normal and correct. Check: `gh run list --branch develop --limit 1`.

## 7. Release: develop → main (ONCE, at v2 completion)

Preconditions — ALL must hold:
- [ ] PROGRESS.md shows Phases 1–6 complete; Phase 6 QA gates green
- [ ] Milan has explicitly said "ship it" on the final preview
- [ ] Tag the outgoing v1 first: `git tag v1-legacy origin/main && git push origin v1-legacy`

> **Launch tag is `v3.0.0`** (owner decision, Phase 5) — a major version,
> even though the project is called "v2" throughout PRD.md/PROGRESS.md.
> The project NAME (v2 rebuild) and the git TAG NUMBER (v3.0.0) are simply
> different things here; don't "fix" this to `v2.0.0` later, it's
> intentional.

```bash
gh pr create --base main --head develop \
  --title "release: The Oven Vibe v2 — full site rebuild" \
  --body "One-shot promotion of develop to main per PRD + release plan.
## Verification
- All PRD §11 phases complete, §10.2 QA gates green
- Owner approved final preview"
gh pr merge <N> --merge            # merge commit; NEVER delete develop
git checkout main && git pull --ff-only origin main
git tag -a v3.0.0 -m "v2 site rebuild launch" && git push origin v3.0.0
```

Post-merge (owner + agent together):
1. If Pages is configured "deploy from branch /root", switch to the
   Actions workflow (or workflow output dir) per Phase 1's CI design —
   verify in repo Settings → Pages BEFORE celebrating.
2. `gh run list --branch main --limit 1` → success → hard-refresh the
   live URL, tap through call + WA order flow on a phone.
3. Old-URL stubs (blog-*.html, faq.html) return 200 → spot-check 3.

## 8. Post-launch: the branch model unfreezes (Portfolio-style flow)

Everything above (§1–7) describes the **v2 rebuild window**, where `main`
is frozen and receives `develop` exactly once. That window ends the
moment §7's launch merge lands and `main` serves v3.0.0 live.

**From then on, `main` is a normal production branch again** — the same
model the Portfolio repo uses day to day:

```
main      = production. Deploys automatically on every merge (the
            `deploy` job in .github/workflows/deploy.yml runs on every
            push to main, not just the launch merge).
develop   = integration, same as before — permanent, never deleted.
feature/* = cut fresh from origin/develop, same as before.
```

The only thing that changes post-launch is step §5 → §7 no longer happens
in one shot at the end of a whole rebuild — it happens **whenever a batch
of merged `develop` work is ready to go live**:

```bash
git fetch origin main develop
gh pr create --base main --head develop \
  --title "release: <short summary of what's shipping>" \
  --body "Promotes develop to main. Verification: npm run build green;
skills/qa-check.md passed."
gh pr merge <N> --merge
git checkout main && git pull --ff-only origin main
# optional: tag notable releases, e.g. git tag v3.1.0 && git push origin v3.1.0
```

Any single content edit (a price change, a new blog post) does NOT need
its own `develop → main` release PR immediately — batch small edits on
`develop` and cut a release PR when there's a meaningful batch ready, or
whenever Milan wants the live site updated. `feature/* → develop` stays
the everyday flow either way; `develop → main` is the only thing that
changed cadence.

## 9. Emergency v1 hotfix (only path that touches main early — PRE-LAUNCH ONLY)

This section is now **historical** — it only applied during the pre-v3.0.0
rebuild window, while `main` was still serving frozen v1 HTML/CSS/JS with
no build step. Once v3.0.0 has shipped, `main` runs the same Astro build
as everything else, so an "emergency hotfix" is just a normal
`hotfix/<slug>` branch off `origin/main`, verified with `npm run build`
like any other change, then released per §8.

Live site broken during the pre-launch rebuild window (kept for reference):
```bash
git checkout -b hotfix/<slug> origin/main    # v1 code, plain HTML — no npm
# minimal fix only; open the file, verify by opening locally in a browser
git push -u origin hotfix/<slug>
gh pr create --base main --head hotfix/<slug> --title "fix: <what>"
# merge → Pages redeploys v1; then IGNORE for develop (v2 replaces it all)
```
Unlike the Portfolio flow there was NO back-merge to develop during this
window — v2 shared no code with v1, so a v1 hotfix was dead code the
moment v2 shipped.

## 10. Checklist (copy per task)

```
[ ] status clean; branch cut fresh from origin/develop
[ ] change made; npm run build passes; UI change → owner approval
[ ] PROGRESS.md updated; conventional commit; push
[ ] merge --no-ff into develop; build the merged state; push develop
[ ] main untouched? (it must be, until the one launch merge)
[ ] gone wrong? → skills/release-recovery.md
```
