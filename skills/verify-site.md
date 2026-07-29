# Skill: verify-site

How to actually look at the site and confirm a change works — beyond the
automated checks in `skills/qa-check.md`. Use this after any change that
touches layout, copy placement, or a new page, and before asking Milan
for the owner-approval sign-off (skills/release-manager.md §3).

## 1. Build, then preview locally

```bash
npm run build
npm run preview
```
`astro preview` serves the exact `dist/` output (not a dev server with
hot-reload) at `http://localhost:4321` — this is the closest local
approximation of what GitHub Pages will actually serve. If port 4321 is
busy, Astro silently falls back to 4322 — read the terminal output for
the real URL rather than assuming 4321
(skills/release-recovery.md §E7).

Kill a stray preview server before starting a new one:
```bash
lsof -ti :4321 | xargs kill 2>/dev/null
```

## 2. Every route returns content, nothing 404s

With `npm run preview` running, open each of these in a browser (or
`curl -sI` each and confirm `200`):
```
/
/menu/
/contact/
/faq/
/blog/
/blog/cloud-kitchen-future/
/blog/veg-vs-non-veg/
/blog/pizza-under-300/
/blog/affordable-pizza/
/blog/late-night-food/
/sundargarh/
/404 (should render the branded not-found page, on purpose)
```
Plus the nine old v1 URL stubs still exist and must still redirect
(AGENTS.md "Fixed decisions" table):
```
/blog-cloud-kitchen-future.html
/blog-veg-vs-non-veg.html
/blog-pizza-under-300.html
/blog-affordable-pizza.html
/blog-late-night-food.html
/contact.html
/faq.html
/blog.html
/sundargarh-770001.html
```

## 3. Check the thing you actually changed, on a real phone-sized viewport

Open the browser's device toolbar (or just narrow the window) to ~390px
wide — this is the primary audience (PRD §2: budget Android phones).
Confirm:
- no horizontal scroll (drag right — the page should not shift)
- the change you made looks right (price, photo, new copy, new post card)
- tap targets (buttons, links) are easy to tap, nothing overlapping

## 4. Tap the actual lead-gen flow

This is the whole point of the site (PRD §1) — always re-check it after
touching `Layout.astro`, `Nav.astro`, `Footer.astro`, or
`WhatsAppFab.astro`:
- tap a `tel:` link → phone dialer opens (or shows the number, in a
  desktop browser) with `+919692261138` (or whatever
  `site.config.json` → `business.phone` currently says)
- tap a WhatsApp link/button → opens `wa.me/919692261138` (or the current
  `business.whatsapp` value) in a new tab

## 5. Console errors

Open the browser dev tools console on a couple of pages. Expect zero
errors. (`/contact/` legitimately logs Google Form iframe warnings — that
third-party noise is expected and not a regression, per PROGRESS.md
Phase 4.)

## 6. Sitemap and robots.txt still make sense

```bash
curl -s http://localhost:4321/robots.txt
curl -s http://localhost:4321/sitemap-index.xml
```
`sitemap-index.xml` should list every route from step 2 (except the old
`.html` stubs, which intentionally carry a canonical to the new route
instead of being separately indexed). If you added a new page (e.g. a
blog post) and it's missing from the sitemap, re-run `npm run build` —
the sitemap integration regenerates on every build; it never needs manual
editing.

## 7. When this isn't enough — the full parity/screenshot suite

See `skills/qa-check.md` §6 for when a full Playwright screenshot pass
(390/768/1440px) is actually warranted — it's expensive and reserved for
shared-chrome or design changes, not routine content edits.

## 8. If something looks broken

- Build/preview won't even start → `skills/troubleshoot-build.md`.
- Page loads but looks wrong → check you actually edited the field you
  meant to (re-read the relevant `skills/update-*.md` file's "Before/
  After" example) and that `npm run build` ran AFTER your latest edit —
  `astro preview` serves whatever `dist/` currently contains, which is
  stale until you rebuild.
