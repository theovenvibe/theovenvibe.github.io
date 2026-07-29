# Skill: update-item-photo

Replace or add a food/product photo, a combo photo, an add-on photo, or a
blog header image. Covers file placement, required formats, sizing, and
the separate OG-image regeneration step needed when the HERO dish or a
blog image changes.

## 1. Where each image type lives (filename = the code, EXACTLY)

| What | Folder | Filename |
|---|---|---|
| Menu item photo | `public/static/images/product_images/` | `{product_code}.webp` (+ `.avif`) |
| Combo photo | `public/static/images/combo_images/` | `{image_code}.webp` (+ `.avif`) — `image_code` normally equals `combo_code` |
| Add-on photo | `public/static/images/add_on_images/` | `{image_code}.webp` (+ `.avif`) |
| Blog post header | `public/static/images/blog_images/` | `blog_N.webp` (+ `.avif`) — `N` is that post's number, e.g. `blog_6.webp` for the 6th post |

The code/number MUST match exactly what's in `menu.json` (`product_code`,
`combo_code`+`image_code`, `addon_code`+`image_code`) — this is
case-sensitive and how `src/lib/data.ts` → `imageFor()` finds the file.
Get the code from `menu.json` first (see `skills/update-price.md` step 2
for how to find an item), THEN name your image file to match it.

## 2. Required formats

- **`.webp` is mandatory.** Every image needs one — the build falls back
  to a brand placeholder (with a build-time warning, not a failure) if
  it's missing.
- **`.avif` is optional but recommended** — smaller file size, faster
  4G loads (PRD §1's LCP target depends on this). Add it whenever you can.
- Never use `.jxl` — no mainstream browser supports it; any leftover
  `.jxl` file in this repo should be deleted, not added to.

## 3. Converting a photo on macOS (built-in `sips`, no installs needed)

Starting from any photo (`.jpg`, `.png`, `.heic` off an iPhone, etc.),
from Terminal, in the folder containing your source photo:

```bash
# to WebP (required)
sips -s format webp my-photo.jpg --out my-photo.webp

# to AVIF (optional, recommended)
sips -s format avif my-photo.jpg --out my-photo.avif
```

Then move both into the correct folder from step 1, renamed to the exact
code, e.g.:
```bash
mv my-photo.webp public/static/images/product_images/NEW001.webp
mv my-photo.avif public/static/images/product_images/NEW001.avif
```

## 4. Photo criteria (what makes a photo usable here)

- **Size:** recommended ≥ 600px wide, 3:2 aspect ratio (matches every
  existing catalogue photo, e.g. `product_images/752649876.webp` is
  600×400). Don't go below ~600px wide — it will look soft next to the
  rest of the catalogue.
- **Background:** black, to match the existing catalogue's unifying look
  (see `docs/archive/RESEARCH.md` for the photo audit that established
  this). A photo on a white/busy background will visibly clash with
  every other card on the menu page — re-shoot or edit the background to
  black before adding it.
- **Crop:** tight, consistent crop on the food itself, same framing style
  as neighboring items in that category. Look at 2–3 existing photos in
  the same `product_images`/`combo_images` folder before shooting, to
  match crop and distance.
- **Never touch the existing catalogue photos** (CLAUDE.md "never touch"
  list) — this skill is for adding a NEW photo or swapping one specific
  file, never for bulk-editing the existing set.

## 5. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`. Check the terminal for:
```
[menu] no image found for code NEW001 — using brand placeholder
```
If you see this for a code you just added a photo for, the filename
doesn't match the code exactly (check spelling and case) or it's in the
wrong folder. Still stuck → `skills/troubleshoot-build.md`.

## 6. When you MUST also regenerate the OG image

Two specific images double as **Open Graph share previews** (what shows
up when the site is shared in WhatsApp/Twitter/Facebook link previews),
and they are separate JPEG files that do NOT auto-update from the
catalogue photo:

- `public/static/images/og/og-default.jpg` — built from the **hero dish**
  photo (`site.config.json` → `hero_dish_code`). Regenerate this whenever
  the hero dish's photo changes, or the hero dish itself changes.
- `public/static/images/og/blog_N.jpg` — built from that blog post's
  header photo. Regenerate whenever `blog_images/blog_N.webp` changes.

**Why a separate file:** WhatsApp and Twitter link previews are unreliable
with WebP/AVIF — these OG images must be plain JPEG at exactly
**1200×630px** (see `src/lib/seo.ts` → `HERO_IMAGE`, and the per-post
`image` object in each `src/pages/blog/*.astro`).

### Regeneration commands (macOS `sips`, two steps: scale, then crop)

For a photo that is **square** (like the blog headers, 1024×1024):
```bash
sips -s format jpeg -z 1200 1200 public/static/images/blog_images/blog_6.webp --out /tmp/step1.jpg
sips -c 630 1200 /tmp/step1.jpg --out public/static/images/og/blog_6.jpg
```

For a photo that is **3:2** (like the product/hero photos, e.g. 600×400):
```bash
sips -s format jpeg -z 800 1200 public/static/images/product_images/752649876.webp --out /tmp/step1.jpg
sips -c 630 1200 /tmp/step1.jpg --out public/static/images/og/og-default.jpg
```
(`-z` takes `height width` in that order — scale the shorter dimension up
past 630/1200 first, THEN `-c 630 1200` center-crops down to the exact
1200×630 canvas. Confirm the result with
`sips -g pixelWidth -g pixelHeight public/static/images/og/og-default.jpg`
— it must print exactly `1200` and `630`.)

For any other aspect ratio, scale so BOTH dimensions are at least
1200×630 before the same `-c 630 1200` crop step — if you scale too
little, the crop step will fail or produce black bars instead of failing
silently, so always check the two `pixelWidth`/`pixelHeight` values after
step 1 are ≥ 1200 and ≥ 630 respectively before running step 2.

## 7. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/update-item-photo origin/develop
# ... add/replace image files, regenerate OG jpg if step 6 applies ...
npm run build
git add public/static/images/product_images/NEW001.webp public/static/images/product_images/NEW001.avif PROGRESS.md
git commit -m "feat(images): add photo for Tandoori Paneer Pizza"
git push -u origin feature/update-item-photo
```
Then merge per `skills/release-manager.md` §5.

## 8. Editing from a phone (GitHub web editor)

Image files can be uploaded through the web editor directly:

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. Navigate into the correct folder from step 1 (e.g.
   `public/static/images/product_images/`).
3. Tap **Add file → Upload files**, choose your `.webp` (and `.avif` if
   you converted one on a computer first — sips conversion needs a Mac or
   another image tool, it can't be done from the GitHub app itself).
4. Name the upload EXACTLY the code from step 1 before uploading, or
   rename it after upload using the pencil icon on the file.
5. Commit to a **new branch** (pick "Create a new branch for this commit
   and start a pull request"), then **Create pull request**.
6. Check the "Checks" tab after ~1–2 minutes: green = safe to merge. If
   you also need step 6's OG regeneration, that step needs `sips` on a
   Mac — flag it to Milan or do it from a computer before merging.
