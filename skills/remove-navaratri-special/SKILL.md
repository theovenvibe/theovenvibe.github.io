---
name: remove-navaratri-special
description: Retire The Oven Vibe's seven Navaratri Special dishes after their expiry, verify static HTML, menu JSON, search markup and ordering surfaces, then release through GitHub.
---

# Remove Navaratri Special

Repo: `D:\Workbench\The Oven Vibe\theovenvibe.github.io`. Owner requested this future recipe on 17 October 2026. Use after the existing cutoff **21 October 2026, 06:00 Asia/Kolkata** (`2026-10-21T00:30:00Z`), or an explicit owner-approved changed cutoff. Do not retire the menu early or reuse these dates for another year.

## Understand the existing expiry

- `src/lib/navaratri-window.ts` owns the cutoff and codes `NAV2026001` through `NAV2026007`.
- `src/lib/data.ts` excludes these records at **build time** after expiry, feeding the menu, comparison guide, order catalogue, schema and `src/pages/menu.json.ts`.
- `src/layouts/Layout.astro` hides `[data-navaratri-special]` in browsers after expiry. Calculator and checkout also guard expired seasonal IDs. CSS hiding does not remove old static HTML, JSON or search markup.
- `.github/workflows/expire-navaratri.yml` schedules a rebuild on 21 October. Its one-time execution guard ends at **22 October 2026, 00:00 UTC**. Dispatching it later can show a successful workflow with all publishing steps skipped. A passing workflow alone is not evidence of expiry.

Read `AGENTS.md`, latest `PROGRESS.md` and [the release checklist](../festival-retirement-release.md). Inspect the actual current state before changing it:

```powershell
rg -n 'NAV202600[1-7]|Navaratri Special|navaratriExpired|data-navaratri-special' menu.json src .github/workflows
gh run list --workflow expire-navaratri.yml --branch main --limit 5
```

## Retire without deleting catalogue history

1. Start the checklist's fresh branch with slug `retire-navaratri-2026`. In root `menu.json`, find **only** the seven product codes above. Set their `status` to `"unavailable"`, retaining the objects, codes, prices, descriptions, photos and category registry. This durable source state prevents accidental revival in later drafts; the existing post-expiry build filter additionally excludes them from published `/menu.json`.
2. Inspect available combos for references to those seven codes. If any actually bundle a retired dish, mark that affected combo unavailable too; do not silently change its contents. Record any such combo in the release notes. Do not disable unrelated combos.
3. Keep `src/lib/navaratri-window.ts`, client guards and the build-time filter. They protect old open tabs and cart IDs. Do not roll the date forward to make specials return or rewrite shared checkout logic.
4. `MenuAccordions.astro` and `choose.astro` use shared available categories: an empty Navaratri section should disappear without deleting those components. Inspect `/`, `/menu/`, `/choose/`, `/price-calculator/`, `/checkout/`, public `/menu.json`, and Restaurant/Menu JSON-LD after rebuilding. No active seasonal dish, order option, category tab or seasonal schema offer should remain.
5. In `src/pages/blog/durga-puja-food.astro`, the existing fallback says the seasonal selection is no longer listed. Check it renders without dead dish fragments. If Durga Puja has also ended, run [its separate removal skill](../remove-durga-puja-promotion/SKILL.md). Do not treat Navaratri expiry as removal of the independent homepage festival links.

## Verify and publish

Run the shared checklist plus `npm run test:menu`, `npm run test:cart` and `npm run test:gallery`. Inspect the actual payload as well:

```powershell
node --input-type=module -e "import {readFileSync} from 'node:fs'; const m=JSON.parse(readFileSync('dist/menu.json','utf8')); const remaining=m.Menu_Items.filter(i=>/^NAV202600[1-7]$/.test(i.product_code)); if(remaining.length) throw Error('Seasonal records still published'); console.log('No Navaratri records in published menu');"
```

Check an existing cart with a seasonal ID is not offered as a valid orderable item. Do not submit a real order or send a customer message during testing. Ordinary dishes, combos, prices, delivery/payment rules, first-party images and Umami must retain their existing behavior.

Release via `feature → develop → main` and verify the actual deploy and live catalogue, even if a scheduled job previously ran. If an already successful scheduled deployment removed the live specials, document that evidence; do not claim the source status cleanup was deployed until its own release succeeds.

Update `TODO.md`, `docs/SEARCH_TODO.md`, `docs/AI_SEARCH_HANDOFF.md`, `PROGRESS.md` and parent `continue-ai-search.md` with the exact seven statuses, any affected combos, live JSON/schema/UI checks, PR/commit/workflow evidence. Keep source photos and history. This is website cleanup only; Zomato and backend configuration need separate scope.
