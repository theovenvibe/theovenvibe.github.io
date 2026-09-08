# Adding a menu photo

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

Photos are 600x400 (3:2), the shape every card already uses:

```sh
# crop/resize a phone photo, then encode both formats
magick input.png -resize 600x400^ -gravity center -extent 600x400 \
  -quality 72 -define webp:method=6 745802385-2.webp
magick input.png -resize 600x400^ -gravity center -extent 600x400 png:- \
  | avifenc -q 48 -s 4 - 745802385-2.avif
```

Check the crop by eye before committing — a centre crop can cut the food.

## Checking it worked

```sh
npm run build && npm run test:gallery
```

The test fails if a photo is missing its `.avif` twin (which would show a
broken slide to AVIF browsers only — invisible in most manual checks), or if
a photo's code matches nothing in the catalogue.
