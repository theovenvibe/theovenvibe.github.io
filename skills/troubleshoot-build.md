# Skill: troubleshoot-build

`npm run build` runs `astro check && astro build` (package.json). When it
fails, the fix is almost always small — this skill teaches you how to
read the three kinds of errors this repo can produce.

## 0. Which command actually failed?

```bash
npm run build
```
Two sub-steps run in order: `astro check` (type/schema checking) then
`astro build` (the actual site build). If `astro check` fails, `astro
build` never runs — you're looking at a type or Zod schema error, not a
build error. Read from the TOP of the output — the first error is the
real one; later errors are often just knock-on noise from the first.

## 1. Zod schema errors (menu.json / site.config.json) — the most common case

These come from `src/lib/data.ts`, which rewrites every Zod failure into
this exact shape:
```
Invalid data — fix these fields and rebuild:
  • menu.json → Menu_Items.5.price: price must be a whole number of rupees
```

How to read this line:
- `menu.json` (or `site.config.json`) — which file to open.
- `Menu_Items.5.price` — the PATH to the broken field: array name
  (`Menu_Items`), then the index (`5` = the 6th item, since it's
  zero-counted), then the field name (`price`). For `site.config.json`
  paths look like `business.hours.close` or `delivery.slabs.1.charge`.
- the message after the colon — plain English, tells you exactly what's
  wrong and usually what a valid value looks like.

**Fix:** open the file named, go to that array/field, fix the value so it
matches the message, save, re-run `npm run build`. Never edit
`src/schemas/menu.ts` or `src/schemas/site-config.ts` to make an error go
away unless Milan explicitly asked for a new field/rule — the schema is
the safety net, not the obstacle.

### Multiple errors at once

If several fields are wrong, they're ALL listed, one bullet per line —
fix them one at a time, top to bottom, don't try to fix from memory after
reading the whole list.

### JSON syntax errors (before Zod even runs)

If you see:
```
menu.json is not valid JSON — usually a missing comma or quote near the
last edit. (Unexpected token } in JSON at position 4821)
```
This means the FILE ITSELF isn't valid JSON — a missing comma, an extra
comma, or a missing closing `}`/`]`. This happens most often right after
appending a new item (skills/add-menu-item.md) or deleting one
(skills/remove-or-disable-item.md). Go back to the exact spot you last
edited and count braces: every `{` needs a matching `}`, every `[` needs
a matching `]`, and every object in an array except the LAST one needs a
trailing comma. A JSON validator (many free ones online, or paste into
any code editor with JSON syntax highlighting) will show you exactly
which character is unexpected.

## 2. TypeScript / Astro type errors

Look like:
```
src/pages/menu.astro:42:18 - error TS2339: Property 'foo' does not exist
on type 'MenuItem'.
```
Read `file:line:column` first, open that exact line. This means either a
typo in a field name (check it against `src/schemas/menu.ts` — field
names must match EXACTLY, they mirror the Zomato export and are never
renamed) or you're trying to use a property that doesn't exist on that
type. If you didn't touch any `.astro`/`.ts` file and only edited
`menu.json`/`site.config.json`, a TS error here is unusual — re-check you
didn't accidentally introduce a stray character while editing the JSON
(e.g. deleted a bracket instead of just a value).

## 3. Astro 7 gotchas specific to this repo (AGENTS.md)

- `src/fetch.ts` is a **reserved filename** in Astro 7 — never create a
  file with that exact name/path, it will break the build in a confusing
  way that doesn't look schema-related.
- Markdown in this repo (blog posts) is NOT processed via a content
  collection — every post is a plain `.astro` file (see
  `skills/add-blog-post.md`). If you're tempted to add a `.md`/`.mdx`
  file expecting it to become a page automatically, it won't — follow
  the `.astro` template instead.
- If a page ever needs `remark`/`rehype` plugins, `@astrojs/markdown-remark`
  must be installed explicitly — Astro 7's default processor doesn't
  include it. This repo currently has no such need; don't add the
  dependency speculatively (style rule: no new dependencies without a
  real reason).
- Astro trims a whitespace-only text node that spans a line break between
  two inline elements down to NOTHING (not a single collapsed space, the
  way a browser would). If you ever see a missing space between two
  words that are each inside their own tag (e.g. `<a>word</a>\n<a>next</a>`
  rendering as "wordnext"), put the second tag on the SAME source line as
  the word before it instead of a new line — this exact bug was found and
  fixed three times during Phase 3 (see PROGRESS.md).

## 4. "It built for me but fails in CI"

Almost always means something is uncommitted. CI only ever sees what was
pushed:
```bash
git status --short     # anything listed here, CI never saw
npm ci                  # exactly what CI runs — NOT `npm install`
npm run build
```
See `skills/deploy-cicd.md` §4 for the full CI-specific version of this.

## 5. Still stuck

- Confirm you're on Node ≥ 22.12: `node -v`.
- Confirm dependencies are actually installed and current:
  `rm -rf node_modules && npm ci`.
- Re-read the VERY FIRST error line in the terminal output, ignore
  everything after it, and re-read whichever section above matches its
  shape. A build with 10 lines of red text is nearly always ONE root
  cause with 9 lines of consequence.
- If the file you're editing is `menu.json` or `site.config.json` and
  none of this helps, the live site is still completely safe — nothing
  merges until `npm run build` passes (skills/release-manager.md §3), so
  there's no time pressure to force a fix through.
