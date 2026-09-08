#!/usr/bin/env python3
"""
Menu photo manager — add, list, reorder and remove the photos on a menu card.

The site shows one photo per item, or a swipeable gallery when an item has
more than one (see docs/MENU_PHOTOS.md). Photos are files on disk, named
after the item's image code: `<code>.webp` is photo 1, `<code>-2.webp` is
photo 2, and so on, each with a matching `.avif`. The numbering must never
skip — the site stops looking at the first gap.

This script does the whole job in one command each, so nothing depends on
remembering the naming or the encoder flags.

    python3 scripts/menu-photo.py find corn
    python3 scripts/menu-photo.py list 745802385
    python3 scripts/menu-photo.py add 745802385 ~/Downloads/new.png
    python3 scripts/menu-photo.py add 745802385 ~/Downloads/new.png --first
    python3 scripts/menu-photo.py promote 745802385 2
    python3 scripts/menu-photo.py remove 745802385 2

Run it from the repo root. Needs Pillow, numpy, ImageMagick (`magick`) and
`avifenc`. After any change: `npm run build && npm run test:gallery`.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ['product_images', 'combo_images', 'add_on_images']
FITTER = os.path.join(ROOT, 'scripts', 'fit-food-photo.py')
WEBP_QUALITY = '72'
AVIF_QUALITY = '48'


def die(msg):
    print(f'error: {msg}', file=sys.stderr)
    sys.exit(1)


def menu():
    with open(os.path.join(ROOT, 'menu.json'), encoding='utf-8') as f:
        return json.load(f)


def entries():
    """(name, code) for everything on the menu, code = the photo's filename."""
    m = menu()
    out = []
    for i in m['Menu_Items']:
        out.append((i['item_name'], str(i.get('image_code') or i['product_code'])))
    for c in m['Combos']:
        out.append((c['combo_name'], str(c['image_code'])))
    for a in m['Add_ons']:
        out.append((a['addon_name'], str(a['image_code'])))
    return out


def folder_for(code):
    """The folder photo 1 already lives in, or product_images for a new item."""
    for d in DIRS:
        if os.path.exists(os.path.join(ROOT, 'public/static/images', d, f'{code}.webp')):
            return os.path.join(ROOT, 'public/static/images', d)
    return os.path.join(ROOT, 'public/static/images', 'product_images')


def slot_path(folder, code, n, ext):
    """Photo 1 is `<code>.<ext>`; photo n>1 is `<code>-n.<ext>`."""
    stem = code if n == 1 else f'{code}-{n}'
    return os.path.join(folder, f'{stem}.{ext}')


def photos(folder, code):
    """Existing photo numbers, in order, stopping at the first gap."""
    found = []
    n = 1
    while os.path.exists(slot_path(folder, code, n, 'webp')):
        found.append(n)
        n += 1
    return found


def check_code(code):
    known = {c for _, c in entries()}
    if code not in known:
        names = [f'{n} -> {c}' for n, c in entries() if code in c]
        hint = ('\n  did you mean: ' + ', '.join(names)) if names else ''
        die(f'{code} is not an image code in menu.json — run `find` to look one up{hint}')


def encode(src, folder, code, n):
    """Fit the photo to the card frame, then write the webp+avif pair."""
    webp, avif = slot_path(folder, code, n, 'webp'), slot_path(folder, code, n, 'avif')
    with tempfile.TemporaryDirectory() as tmp:
        fitted = os.path.join(tmp, 'fitted.png')
        subprocess.run([sys.executable, FITTER, src, fitted], check=True)
        subprocess.run(['magick', fitted, '-quality', WEBP_QUALITY,
                        '-define', 'webp:method=6', webp], check=True)
        subprocess.run(['avifenc', '-q', AVIF_QUALITY, '-s', '4', fitted, avif],
                       check=True, capture_output=True)
    print(f'wrote {os.path.relpath(webp, ROOT)} ({os.path.getsize(webp) // 1024} KB)')
    print(f'wrote {os.path.relpath(avif, ROOT)} ({os.path.getsize(avif) // 1024} KB)')


def renumber(folder, code, order):
    """Rewrite the slots so the photos land in `order` (a list of old numbers).

    Goes through temporary names first — renaming 2 to 1 while 1 still exists
    would otherwise clobber a photo.
    """
    with tempfile.TemporaryDirectory() as tmp:
        for i, old in enumerate(order, start=1):
            for ext in ('webp', 'avif'):
                src = slot_path(folder, code, old, ext)
                if os.path.exists(src):
                    shutil.move(src, os.path.join(tmp, f'{i}.{ext}'))
        for n in photos(folder, code) + [len(order) + 1, len(order) + 2]:
            for ext in ('webp', 'avif'):
                leftover = slot_path(folder, code, n, ext)
                if os.path.exists(leftover):
                    os.remove(leftover)
        for i in range(1, len(order) + 1):
            for ext in ('webp', 'avif'):
                staged = os.path.join(tmp, f'{i}.{ext}')
                if os.path.exists(staged):
                    shutil.move(staged, slot_path(folder, code, i, ext))


def cmd_find(args):
    needle = args.text.lower()
    hits = [(n, c) for n, c in entries() if needle in n.lower() or needle in c]
    if not hits:
        die(f'nothing on the menu matches "{args.text}"')
    for name, code in hits:
        n = len(photos(folder_for(code), code))
        print(f'{code}  {n} photo{"s" if n != 1 else ""}  {name}')


def cmd_list(args):
    check_code(args.code)
    folder = folder_for(args.code)
    found = photos(folder, args.code)
    if not found:
        print(f'{args.code}: no photos yet — the card shows the brand placeholder')
        return
    for n in found:
        webp = slot_path(folder, args.code, n, 'webp')
        avif = slot_path(folder, args.code, n, 'avif')
        missing = '' if os.path.exists(avif) else '   ** no .avif — AVIF browsers see a broken slide **'
        label = 'photo 1 (shown first)' if n == 1 else f'photo {n}'
        print(f'{label}: {os.path.relpath(webp, ROOT)} ({os.path.getsize(webp) // 1024} KB){missing}')


def cmd_add(args):
    check_code(args.code)
    if not os.path.exists(args.image):
        die(f'no such file: {args.image}')
    folder = folder_for(args.code)
    found = photos(folder, args.code)
    new_slot = len(found) + 1
    encode(args.image, folder, args.code, new_slot)
    if args.first and found:
        renumber(folder, args.code, [new_slot] + found)
        print(f'{args.code}: new photo is now photo 1, the others shift down')
    else:
        where = 'the only photo' if new_slot == 1 else f'photo {new_slot}'
        print(f'{args.code}: added as {where}')
    print('next: npm run build && npm run test:gallery')


def cmd_promote(args):
    check_code(args.code)
    folder = folder_for(args.code)
    found = photos(folder, args.code)
    if args.number not in found:
        die(f'{args.code} has no photo {args.number} (it has {len(found)})')
    if args.number == 1:
        print('already photo 1 — nothing to do')
        return
    renumber(folder, args.code, [args.number] + [n for n in found if n != args.number])
    print(f'{args.code}: photo {args.number} is now photo 1')
    print('next: npm run build && npm run test:gallery')


def cmd_remove(args):
    check_code(args.code)
    folder = folder_for(args.code)
    found = photos(folder, args.code)
    if args.number not in found:
        die(f'{args.code} has no photo {args.number} (it has {len(found)})')
    if len(found) == 1 and not args.leave_no_photo:
        die('that is the only photo — the card would fall back to the brand '
            'placeholder. Add the replacement first, or pass --leave-no-photo '
            'if that is really what you want.')
    for ext in ('webp', 'avif'):
        p = slot_path(folder, args.code, args.number, ext)
        if os.path.exists(p):
            os.remove(p)  # git sees the deletion when you `git add -A` below
    renumber(folder, args.code, [n for n in found if n != args.number])
    print(f'{args.code}: removed photo {args.number}; {len(found) - 1} left')
    print('next: npm run build && npm run test:gallery')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest='cmd', required=True)

    f = sub.add_parser('find', help='look up an item and its image code')
    f.add_argument('text', help='part of the item name, or a code')
    f.set_defaults(func=cmd_find)

    l = sub.add_parser('list', help='show the photos an item has, in order')
    l.add_argument('code')
    l.set_defaults(func=cmd_list)

    a = sub.add_parser('add', help='fit, encode and add a photo')
    a.add_argument('code')
    a.add_argument('image', help='the photo off the camera or phone')
    a.add_argument('--first', action='store_true', help='show it before the existing photos')
    a.set_defaults(func=cmd_add)

    pr = sub.add_parser('promote', help='make an existing photo the first one')
    pr.add_argument('code')
    pr.add_argument('number', type=int)
    pr.set_defaults(func=cmd_promote)

    r = sub.add_parser('remove', help='delete a photo and close the gap')
    r.add_argument('code')
    r.add_argument('number', type=int)
    r.add_argument('--leave-no-photo', action='store_true',
                   help='allow removing the last photo, leaving the placeholder')
    r.set_defaults(func=cmd_remove)

    args = p.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
