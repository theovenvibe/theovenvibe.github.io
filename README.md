> **9 October 2026 — stock retirement is live.** The website publishes no
> stock_recipe; legacy draft/rollback publication strips it. Menu names, prices,
> descriptions, component quantities and photos are unchanged. Manual sold-out
> and late-night controls, waitlists and dish costing remain. Dough classification
> uses trusted catalogue metadata independently of counts. See the backend's
> [operating policy](https://github.com/theovenvibe/the-oven-vibe-backend/blob/develop/docs/STOCK_RETIREMENT.md) and
> [verified release](https://github.com/theovenvibe/the-oven-vibe-backend/blob/develop/docs/STOCK_RETIREMENT_RELEASE.md).

# The Oven Vibe — Sundargarh, Odisha

Current delivery and checkout policy: [docs/DELIVERY_PRICING.md](docs/DELIVERY_PRICING.md).

Digital menu + lead-generation website for **The Oven Vibe**, a 100% pure
vegetarian cloud kitchen in Sundargarh, Odisha (pin 770001). Live at
[theovenvibe.github.io](https://theovenvibe.github.io).

The Astro frontend is static; a separate Cloudflare Worker records direct
orders and serves the protected kitchen console. Checkout hands off to WhatsApp,
with no payment gateway. Backend outages never block that hand-off.

## What this repo is (v2 rebuild)

This is a from-scratch rebuild of the original static HTML/CSS/JS site,
on Astro + Tailwind, now live from `main`. Changes integrate on `develop`;
production releases are approved batches. See **Branch model** below before
pushing anything and skills/release-manager.md §8 for post-launch rules.

The full requirements and every binding decision live in `PRD.md`. Current
phase status and the session-by-session history live in `PROGRESS.md`.
Read both before making a non-trivial change.

## Quickstart

```bash
npm install
npm run dev       # http://localhost:4321, hot-reload
npm run build     # astro check && astro build — must be green before any commit
npm run preview   # serves the built dist/ output, closest thing to production locally
```

Requires Node ≥ 22.12 (CI runs Node 24).

## Tech stack

Astro 7 (static output, zero client JS by default) + Tailwind CSS v4 +
TypeScript strict. Two JSON files, each guarded by a Zod schema, are the
entire content model — there is no CMS and no database.

## How content editing works

Nobody edits page components to change a price, an hour, or a photo.
Everything a non-technical person needs to change lives in one of two
files, both plain JSON, both validated at build time:

- **`menu.json`** — the menu itself: items, combos, add-ons. Mirrors the
  Zomato catalogue export; field names are never renamed.
- **`site.config.json`** — every business fact that isn't a menu item:
  delivery charges, hours, phone/WhatsApp, address, Google rating,
  the announcement banner, and (Phase 5+) the Umami analytics ID.

Both are validated by Zod (`src/schemas/`) on every `npm run build` — a
malformed edit fails the build with a plain-English error naming the
exact file and field, and the **live site is never affected** by a bad
edit; GitHub Pages keeps serving the last good deploy until a valid build
replaces it.

**`skills/` is the instruction manual.** Every common task — change a
price, add a menu item, swap a photo, add a blog post, update hours, roll
back a bad release — has its own step-by-step file in `skills/`, written
so a small local model (or a person on a phone) can do it unassisted:
exact file paths, a before/after example, the exact verify command, and
the GitHub-web-editor-on-a-phone flow. Start with `AGENTS.md`, then open
the one `skills/*.md` file that matches your task.

## Project structure

```
menu.json                ← THE menu (items, combos, add-ons) — Zomato mirror
site.config.json         ← business settings (delivery, hours, phone, rating, analytics)
src/
  schemas/                ← Zod schemas guarding both JSON files
  lib/data.ts             ← the ONLY place the JSON files are loaded/read from
  lib/seo.ts              ← all structured data (JSON-LD) + off-site links
  components/             ← Nav, Footer, MenuCard, Seo, WhatsAppFab, etc.
  layouts/Layout.astro     ← base page shell (head, nav, footer, JSON-LD)
  pages/                  ← routes: /, /menu/, /contact/, /faq/, /blog/, /sundargarh/, /404
  styles/                 ← global.css (design system) + polish.css (motion layer)
public/
  static/images/          ← food photos (AVIF+WebP), blog images, OG share images
  *.html                  ← old v1 URL stubs (meta-refresh redirects) — do not delete
  scripts/                ← site.js (interactions) + polish.js (motion)
skills/                   ← step-by-step task guides — start here for any content edit
docs/
  SEO_PLAYBOOK.md          ← what the site does for SEO vs. what only the owner can do
  archive/                 ← historical design research/decisions (superseded, kept for context)
.github/workflows/deploy.yml ← build every branch; deploy only from main
PRD.md                    ← requirements (binding)
PROGRESS.md                ← phase checklist + session log (read this first each session)
AGENTS.md                  ← cold-start primer for any agent/model working in this repo
```

## Branch model (post-launch)

```
main      = PRODUCTION. Approved batched releases arrive from develop.
            Deploys on each push; do not commit documentation here directly.
develop   = integration branch. Work lands here via feature branches.
feature/* = cut fresh from origin/develop, one purpose each, deleted after merge.
```

Full workflow (branch → verify → commit → merge, plus what to do when it
goes wrong): `skills/release-manager.md` + `skills/release-recovery.md`.
Use the feature → develop → release-PR-to-main flow — see
`skills/release-manager.md` §8.

## Deploy model

GitHub Actions (`.github/workflows/deploy.yml`) builds every push on
every branch (`main`, `develop`, `feature/**`, `hotfix/**`) but only
**deploys** when the push lands on `main` — "deploy: skipping" on any
other branch is expected, not a failure. Full explanation, how to read
`gh run list`, and the launch-day Pages-source switch:
`skills/deploy-cicd.md`.

## Further reading

- [`PRD.md`](./PRD.md) — product requirements, binding decisions, the
  build-phase plan.
- [`PROGRESS.md`](./PROGRESS.md) — current phase, what's done, what's next.
- [`AGENTS.md`](./AGENTS.md) — repo primer for any agent/model: golden
  rules, repo map, common tasks → skills.
- [`docs/SEO_PLAYBOOK.md`](./docs/SEO_PLAYBOOK.md) — what the site does
  for local SEO on its own vs. what only the owner can do (Google
  Business Profile, reviews, citations).
