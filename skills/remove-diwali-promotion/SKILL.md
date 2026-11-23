---
name: remove-diwali-promotion
description: Retire The Oven Vibe's Diwali homepage and featured-blog promotion after the campaign, archive the existing guide without breaking its URL and release through GitHub.
---

# Remove the Diwali promotion

Repo: `D:\Workbench\The Oven Vibe\theovenvibe.github.io`. Run after the owner-confirmed Diwali campaign end. The current guide is for **8 November 2026**, but that festival date alone does not define a multi-day campaign's closing time. Owner requested this future recipe on 17 October 2026. No automatic Diwali homepage expiry is configured.

Read `AGENTS.md`, latest `PROGRESS.md` and [the release checklist](../festival-retirement-release.md). Start its fresh branch **before editing**, with slug `retire-diwali-2026`.

```powershell
rg -n -i 'diwali|festival-planning' src menu.json site.config.json
```

## Make these edits

1. In `src/pages/index.astro`, remove the `/blog/diwali-party-menu/` link labelled **Plan your Diwali order**, plus its adjoining separator. If the Durga Puja link was already removed, remove the entire `aria-labelledby="festival-planning"` section and heading. Never leave a stale Durga Puja link as the sole replacement; use [its skill](../remove-durga-puja-promotion/SKILL.md) if that cleanup is still pending.
2. In `src/pages/blog/index.astro`, remove the Diwali object from the festival-card array (path `/blog/diwali-party-menu/`). When both festival objects are gone, remove the empty map expression, `festivalPhoto` declaration and imports only if unused. Keep the ordinary article cards.
3. Preserve `src/pages/blog/diwali-party-menu.astro` and its canonical `/blog/diwali-party-menu/`. Add a visible **2026 Diwali campaign has ended** notice with `/menu/` and `/choose/` links. Keep useful gathering/ingredient/portion advice. Rewrite the current-season opening, meta description and active Diwali ordering CTA so the page reads as an archived 2026 guide, without claiming future slots or offers. The historical festival date may remain, clearly in the past; do not simply relabel it as next year's date.
4. Preserve original `datePublished: '2026-10-17'`. Add the actual edit date as `dateModified` in the article's `blogPostingJsonLd` call and as `modified` in its `src/lib/editorial.ts` entry. Visible byline and schema must match.
5. In `src/pages/blog/durga-puja-food.astro`, remove or rewrite the **Planning for the next gathering?** Diwali cross-link, so an expired event is not advertised as upcoming.
6. At recipe creation there are **no Diwali-only menu items or prices**: the guide reuses the regular menu. Do not disable pizzas, sandwiches, drinks, combos or any other regular dish. If a later release adds real Diwali-only records, identify them from that release and owner instructions before using `skills/remove-or-disable-item.md`; do not guess from dish names. Preserve first-party images and Umami.

## Verify and publish

Use the shared release checklist. Confirm:

- `/` and `/menu/` no longer advertise Diwali as active; no empty festival section remains.
- `/blog/` has no current Diwali promo card, and the Puja guide has no upcoming Diwali CTA.
- Both retained article URLs still return 200, with valid canonicals/schema and honest dates. Keeping an archived guide does not mean its campaign is still active.
- `/menu/`, `/choose/`, calculator and checkout retain regular items and prices. Do not submit a real order.

Record completion in `TODO.md`, `docs/SEARCH_TODO.md`, `docs/AI_SEARCH_HANDOFF.md`, `PROGRESS.md` and parent `continue-ai-search.md`, including exact PR, commit, deploy and live checks. No social-post deletion, Google removal request, ad change or Zomato change is implied. If already retired, verify and document the existing result rather than repeating it.
