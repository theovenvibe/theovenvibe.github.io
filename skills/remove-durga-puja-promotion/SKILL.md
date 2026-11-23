---
name: remove-durga-puja-promotion
description: Retire The Oven Vibe's Durga Puja homepage promotion after the campaign ends, preserve its article URL, verify the result and release through GitHub.
---

# Remove the Durga Puja promotion

Use in `D:\Workbench\The Oven Vibe\theovenvibe.github.io` after the owner says the Durga Puja campaign has ended. This is a future cleanup recipe, not an instruction to remove it during the festival. Owner requested this recipe on 17 October 2026. No automatic Durga Puja homepage expiry currently exists.

## Prepare

Read `AGENTS.md`, latest `PROGRESS.md` and [the release checklist](../festival-retirement-release.md). Start its fresh feature branch **before editing**; use branch slug `retire-durga-puja-2026`. Inspect current source: later changes may have moved these links.

```powershell
rg -n -i 'durga.puja|festival-planning|navaratri' src
```

## Make these edits

1. In `src/pages/index.astro`, find `aria-labelledby="festival-planning"`. Remove the `/blog/durga-puja-food/` link labelled **Durga Puja food choices** and its adjoining separator. Keep the Diwali link while that campaign is active. If no festival links remain, remove the entire festival-planning section, including its heading, rather than leaving empty space.
2. In `src/pages/blog/index.astro`, the festival-card array currently contains Durga Puja and Diwali. Remove only the Durga Puja object (path `/blog/durga-puja-food/`). Keep the Diwali object and regular articles. If the array is now empty, remove its map expression and the `festivalPhoto` declaration/imports only where no longer used.
3. Keep `src/pages/blog/durga-puja-food.astro` reachable at its existing canonical URL. Add a visible factual notice that the **2026 campaign has ended**, with a `/menu/` link. Remove its active-season specials list and associated `categories`, `displayDescription`, `itemUrl` imports / `specials` declaration when unused. Replace the seasonal heading/description and active ordering CTA with wording for an archived planning guide. Keep useful ingredient advice without promising seasonal availability.
4. Preserve original `datePublished: '2026-10-17'`. When editing the article, add the actual edit date as `dateModified` in its `blogPostingJsonLd` call and as `modified` for that path in `src/lib/editorial.ts`, so visible byline and schema agree. Do not hard-code a future date.
5. Keep any Diwali cross-link only while it is still a relevant upcoming campaign. Do not remove unrelated regular menu items, images or blog routes. Navaratri dishes have their own cleanup: [remove-navaratri-special](../remove-navaratri-special/SKILL.md). Retiring this homepage link alone does not retire those dishes.

## Verify and publish

Follow the linked release checklist, including build, search QA, actual preview and `feature → develop → main` release. Check specifically:

- `/` and `/menu/` contain no active Durga Puja promotional link/card; `/blog/` no longer promotes it as current.
- `/blog/durga-puja-food/` still returns 200, keeps its canonical and has the ended notice. Its JSON-LD remains valid; visible and schema edit dates match.
- No dead separators, empty festival heading or broken menu fragment links.
- Diwali promotion remains if its campaign is active; ordinary dishes/prices and Umami are unchanged.

Update `TODO.md`, `docs/SEARCH_TODO.md`, `docs/AI_SEARCH_HANDOFF.md`, `PROGRESS.md` and the parent `continue-ai-search.md` with the actual outcome, PR, commit and deploy evidence. Check off only this completed retirement. If already removed, verify the live result and record it; do not create duplicate edits or claim a new deployment.
