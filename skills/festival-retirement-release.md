# Festival retirement: GitHub and verification checklist

Supporting recipe for the three `remove-*/SKILL.md` festival skills. Commands use PowerShell from `D:\Workbench\The Oven Vibe\theovenvibe.github.io`. Substitute the chosen skill's branch slug and the actual PR/run numbers; do not paste placeholder numbers. A human can use this with a terminal and browser; an agent follows the same evidence checks.

## Start from current source

```powershell
Set-Location 'D:\Workbench\The Oven Vibe\theovenvibe.github.io'
git status --short --branch
git remote get-url origin
git fetch origin main develop --quiet
git log --oneline origin/main..origin/develop
```

Origin must be `theovenvibe/theovenvibe.github.io`. Preserve unrelated dirty work; use an isolated worktree if needed. Review any unreleased develop changes before a production release: a develop-to-main merge includes them too. Do not ship unrelated work implicitly. Read `skills/release-manager.md` §8 and `skills/release-recovery.md` for an isolated hotfix when appropriate.

```powershell
git checkout -b feature/retire-durga-puja-2026 origin/develop
```

Use `feature/retire-navaratri-2026` or `feature/retire-diwali-2026` for the other skills. For a combined cleanup, keep independently reviewable changes per `skills/stacked-prs.md`. Follow the selected skill's exact edit scope; retain article URLs and source photographs. None of these files schedule future cleanup by themselves.

## Verify the feature and preview

```powershell
npm run build
npm run test:search
git diff --check
git diff --stat
npm run preview -- --host 127.0.0.1
```

Run the extra menu/cart/gallery checks required by the Navaratri skill. Follow `skills/qa-check.md`; the current search audit also parses JSON-LD and verifies canonicals, metadata, menu/schema price parity, actual fragment links, ratings and rendered emoji policy. Inspect the actual preview URL printed by Astro at desktop and about 390px wide: home, menu, blog index, affected retained article, choose, calculator and checkout. Stop the preview server after review. Do not edit `dist/`.

Confirm only the intended seasonal promotion/availability changed. Keep `site.config.json`, analytics/Umami, payment/delivery rules, original images and backend unchanged. This owner request establishes the intended post-event removals. If an additional design/copy change goes beyond this scope, obtain the required preview review under release-manager §3 before merging that additional change.

## Commit and push a concrete diff

Update `PROGRESS.md`, relevant retirement checkboxes in `TODO.md` / `docs/SEARCH_TODO.md` and `docs/AI_SEARCH_HANDOFF.md`. Stage only the exact changed files; do not use `git add .`.

```powershell
git add src/pages/index.astro src/pages/blog/index.astro src/pages/blog/durga-puja-food.astro src/lib/editorial.ts TODO.md docs/SEARCH_TODO.md docs/AI_SEARCH_HANDOFF.md PROGRESS.md
git diff --cached --stat
git commit -m 'fix(seasonal): retire Durga Puja promotion'
git push -u origin HEAD
```

That file list is the Durga Puja example. For Diwali include the Diwali article and any Puja cross-link edit. For Navaratri include `menu.json` plus actual affected files; never stage nonexistent or unrelated edits. Use an accurate commit title.

Write the PR body as a UTF-8 temporary file outside the repo, recording the campaign end, removed surfaces, preserved archive URLs and verification results. Then:

```powershell
gh pr create --base develop --head feature/retire-durga-puja-2026 --title 'fix(seasonal): retire Durga Puja promotion' --body-file "$env:TEMP\oven-festival-pr.md"
gh pr checks <feature-PR-number> --watch
gh pr merge <feature-PR-number> --merge
git checkout develop
git pull --ff-only origin develop
npm run build
npm run test:search
```

Use the actual branch and actual feature PR number. Re-run required QA on the merged state and extra menu/cart/gallery checks for Navaratri. If checks fail, fix/review the relevant source rather than bypassing them.

## Publish and verify production

Write the release PR body to a separate temporary file with the exact included scope and validation. This is the normal publication step when the selected retirement is due and authorized:

```powershell
gh pr create --base main --head develop --title 'release: retire completed festival promotion' --body-file "$env:TEMP\oven-festival-release.md"
gh pr checks <release-PR-number> --watch
gh pr merge <release-PR-number> --merge
git checkout main
git pull --ff-only origin main
gh run list --workflow deploy.yml --branch main --limit 5
gh run view <actual-deploy-run-number>
node scripts/audit-live-search.mjs
```

Wait for the **actual Astro `deploy.yml` build, Lighthouse and Pages deployment** for the released SHA to succeed. A feature push or develop merge is not a live release. The legacy Jekyll job is separate; never add root `.nojekyll`, force-push main or change Pages settings to bypass it.

Open `https://theovenvibe.com/`, `/menu/`, `/choose/`, `/blog/` and affected retained articles. For Navaratri also inspect live `/menu.json` and Menu JSON-LD: the seven codes must be absent from the published catalogue/offers, not merely hidden by CSS. Do not assume cached search results immediately update or claim indexing/citation success from deployment.

Record PR links, released SHA, actual workflow URL, live checks and any pending issue in `PROGRESS.md`, `docs/AI_SEARCH_HANDOFF.md` and parent `D:\Workbench\The Oven Vibe\continue-ai-search.md`. Preserve previous release evidence. Update retirement checkboxes only after live verification. If post-release verification fails, report the specific failure and use a normal revert/fix PR via `skills/release-recovery.md`; do not report completion. Do not reset/force-push or silently roll back unrelated work. No social post, customer message, search-engine removal request, Zomato change or automatic future deployment is included.
