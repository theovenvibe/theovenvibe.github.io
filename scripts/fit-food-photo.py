#!/usr/bin/env python3
"""
Fit a food photo into the 600x400 card frame with the whole dish visible.

A plain centre crop cuts the top and bottom off these shots — every dish in
the 2026-09 batch is square or taller than 3:2, so the pizza lost its crust
and the trays lost their ends. This instead:

  1. finds the dish (everything brighter than the near-black backdrop),
  2. lays a taller-than-wide dish on its side, so a portrait tray shot fills
     the landscape frame instead of shrinking into the middle of it,
  3. scales the whole dish into the band of the frame that survives the
     card's own `object-fit: cover` crop at every breakpoint, and centres it,
  4. fills the frame behind it with a radial gradient sampled from the
     photo's own backdrop, so there are no bars and no visible seam.

Usage:
    python3 scripts/fit-food-photo.py in.png out.png
    python3 scripts/fit-food-photo.py in.png out.png --no-rotate

Needs Pillow and numpy. Encode the result to .webp/.avif afterwards — see
docs/MENU_PHOTOS.md.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

WIDTH, HEIGHT = 600, 400
BACKDROP_LUMA = 45  # anything darker than this is backdrop, not food
MARGIN = 0.95       # how much of the frame's WIDTH the dish may fill
# `.menu-card-img` is `aspect-ratio: 3/2` at every breakpoint (global.css), so
# a 3:2 photo is shown whole and the dish can use nearly the full frame. Leave
# a little room so the dish never touches the card's rounded corners.
SAFE_HEIGHT = 0.93


def subject_box(im):
    luma = np.asarray(im).astype(int).sum(2) / 3
    ys, xs = np.where(luma > BACKDROP_LUMA)
    if not len(xs):
        raise SystemExit('no subject found — is the backdrop this dark?')
    return xs.min(), ys.min(), xs.max(), ys.max()


def backdrop(im):
    """Radial gradient in the photo's own backdrop colour."""
    a = np.asarray(im).astype(float)
    edge = np.concatenate([a[:12].reshape(-1, 3), a[-12:].reshape(-1, 3),
                           a[:, :12].reshape(-1, 3), a[:, -12:].reshape(-1, 3)])
    corner = np.median(edge, 0)
    centre = np.clip(corner * 1.9 + 10, 0, 255)
    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    d = np.sqrt(((xx - WIDTH / 2) / (WIDTH / 2)) ** 2 + ((yy - HEIGHT / 2) / (HEIGHT / 2)) ** 2)
    t = np.clip(d / 1.25, 0, 1)[..., None]
    return Image.fromarray((centre * (1 - t) + corner * t).astype(np.uint8))


def fit(src, dst, rotate=True):
    im = Image.open(src).convert('RGB')
    x0, y0, x1, y1 = subject_box(im)
    if rotate and (x1 - x0) < (y1 - y0):
        im = im.transpose(Image.ROTATE_270)
        x0, y0, x1, y1 = subject_box(im)

    w, h = x1 - x0, y1 - y0
    scale = min(WIDTH * MARGIN / w, HEIGHT * SAFE_HEIGHT / h)
    dish = im.crop((x0, y0, x1, y1)).resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)

    canvas = backdrop(im)
    # Feather the paste, or the crop rectangle shows as a faint edge.
    mask = Image.new('L', dish.size, 0)
    ImageDraw.Draw(mask).rectangle([6, 6, dish.width - 7, dish.height - 7], fill=255)
    canvas.paste(dish, ((WIDTH - dish.width) // 2, (HEIGHT - dish.height) // 2),
                 mask.filter(ImageFilter.GaussianBlur(6)))
    canvas.save(dst)
    print(f'{dst}: dish {dish.width}x{dish.height} in {WIDTH}x{HEIGHT}')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        raise SystemExit(__doc__)
    fit(args[0], args[1], rotate='--no-rotate' not in sys.argv)
