# Skill: manage-menu-photos

Add a photo to a menu card, change which photo shows first, or remove one.
Cards with more than one photo let the customer swipe between them, the way
Zomato does.

Everything here is one command. Follow it literally — you do not need to know
the file naming, the crop maths, or the encoder flags, because
`scripts/menu-photo.py` does all three.

**Related skills:** `skills/take-a-food-photo.md` (how to shoot a photo this
works well on), `skills/update-item-photo.md` (OG share images, phone-only
uploads), `skills/release-manager.md` (how to ship the change).

## 0. What you need once

Python with Pillow and numpy, ImageMagick, and `avifenc`:

```bash
python3 -c "import PIL, numpy; print('python ok')"
magick --version | head -1
avifenc --version | head -1
```

If any of those is missing, install it before going further — on Arch:
`sudo pacman -S python-pillow python-numpy imagemagick libavif`.

## 1. Find the item's code

Photos are named after the item's **image code**, not its name. Look it up
with part of the name:

```bash
python3 scripts/menu-photo.py find corn
```

```
745802385  1 photo   Golden Corn Classic Pizza [Regular, 7 inches]
ADD002     1 photo   Sweet Corn
```

The first column is the code. Pick the right row — "corn" matches an add-on
too. Some items share a code on purpose (both fries sizes share one photo),
so one change can cover two menu rows.

See what an item has now:

```bash
python3 scripts/menu-photo.py list 745802385
```

## 2. Add a photo

```bash
python3 scripts/menu-photo.py add 745802385 ~/Downloads/new-pizza.png
```

That fits the dish into the card frame, writes both `.webp` and `.avif`, and
puts it after the photos already there. To make the new photo the one the
customer sees first:

```bash
python3 scripts/menu-photo.py add 745802385 ~/Downloads/new-pizza.png --first
```

## 3. Change the order

Make photo 2 the first one (the rest shift down, keeping their order):

```bash
python3 scripts/menu-photo.py promote 745802385 2
```

## 4. Remove a photo

```bash
python3 scripts/menu-photo.py remove 745802385 2
```

The remaining photos are renumbered so there is never a gap — the site stops
looking at the first missing number, so a gap would silently hide every photo
after it.

Removing an item's **only** photo is refused, because the card would fall back
to the brand logo. Add the replacement first, then remove the old one:

```bash
python3 scripts/menu-photo.py add 760595845 ~/Downloads/new-maggi.png --first
python3 scripts/menu-photo.py remove 760595845 2
```

## 5. Check it — every time, no exceptions

```bash
npm run build && npm run test:gallery
```

Expect `0 errors` and `N passed, 0 failed`. The test catches the two mistakes
that are invisible in a normal look at the site: a photo whose `.avif` twin is
missing (only AVIF browsers see the break) and a photo filed under a code that
matches nothing on the menu.

Then LOOK at it, because a green build is not evidence the card is right:

```bash
npm run dev
```

Open http://localhost:4321, expand the item's category, and swipe/drag the
photo. Check the dish is whole and centred, and that the dots move with it.

## 6. Ship it

```bash
git status --short                       # review what changed
git fetch origin develop --quiet
git checkout -b feature/menu-photos-<what> origin/develop
git add -A public/static/images PROGRESS.md
git commit -m "feat(images): <what changed, e.g. new photo for Golden Corn Pizza>"
git push -u origin feature/menu-photos-<what>
```

Then follow `skills/release-manager.md` §8.1: merge to `develop` after the
build and `skills/qa-check.md` pass, and cut a `develop → main` release PR
when the live site should update.

`git push` fails with the default credentials in this repo — use
`git -c credential.helper='!gh auth git-credential' push ...`.

## 7. When something looks wrong

| What you see | What it means |
|---|---|
| Card shows the brand logo instead of food | No photo for that code, or the filename does not match. `list` the code. |
| `error: <code> is not an image code` | You used the `product_code` where the item has a separate `image_code`. Use `find`. |
| Photo looks washed out / has a grey box behind it | The photo was not shot on a dark backdrop — see `skills/take-a-food-photo.md`. |
| Dish is cut off at an edge | The dish was already touching the edge in the original file. No crop can recover it; reshoot with space around the dish. |
| Test says "has no .avif sibling" | An encode failed. Re-run the same `add` command. |
| Build warns `no image found for code X` | The item has no photo at all — expected only for a brand-new menu item. |
