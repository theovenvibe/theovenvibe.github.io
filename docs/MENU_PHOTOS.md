# Adding a menu photo

> Day to day, don't do any of this by hand — `skills/manage-menu-photos.md`
> wraps it all in one command per job (`scripts/menu-photo.py add|promote|
> remove|find|list`). This document is the reference for what those commands
> do and why the conventions are what they are.

The menu shows one photo per item, or a swipeable gallery when an item has
more than one. Adding a photo is a file drop — `menu.json` never mentions
images.

## Where photos live

`public/static/images/product_images/` (combos: `combo_images/`, add-ons:
`add_on_images/`).

Each photo is a pair — `<code>.avif` and `<code>.webp` — where `<code>` is
the item's `image_code` if it has one, otherwise its `product_code`. Look the
code up in `menu.json`; several items can share one code (both fries sizes
share `745802374`, so one photo covers both).

## Adding a second, third, … photo

Name it after the same code with `-2`, `-3`, … appended:

```
745802385.webp     ← photo 1
745802385.avif
745802385-2.webp   ← photo 2, shown when the customer swipes
745802385-2.avif
```

The numbering must not skip. The scan stops at the first missing number, so a
`-4` with no `-3` is invisible.

## Making the files

Photos are 600x400 (3:2), the shape every card already uses.

Do NOT centre-crop a studio shot to that shape. These dishes are square or
taller, so a centre crop takes the crust off a pizza and the ends off a tray.
Use the fitter instead — it finds the dish, lays a portrait tray on its side,
centres it whole, and fills the rest of the frame with the photo's own
backdrop:

```sh
python3 scripts/fit-food-photo.py input.png fitted.png   # needs Pillow + numpy
magick fitted.png -quality 72 -define webp:method=6 745802385-2.webp
avifenc -q 48 -s 4 fitted.png 745802385-2.avif
```

Pass `--no-rotate` if a dish reads wrong on its side. The fitter assumes a
near-black backdrop (`BACKDROP_LUMA` in the script); a photo shot on a light
surface needs a hand crop.

Check the result by eye before committing.

## Checking it worked

```sh
npm run build && npm run test:gallery
```

The test fails if a photo is missing its `.avif` twin (which would show a
broken slide to AVIF browsers only — invisible in most manual checks), or if
a photo's code matches nothing in the catalogue.
