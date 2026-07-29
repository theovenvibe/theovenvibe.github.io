# Skill: add-menu-item

Add a brand-new item to the menu. Two steps: append one object to
`menu.json`, drop one image file in. Nothing else needs to change — the
menu page, home page, and SEO data all render from `menu.json`
automatically (there is no separate list of items anywhere else in the
code).

## 1. Pick a product code and item_id

Open `menu.json`, look at the LAST object in the `Menu_Items` array.

- `product_code`: must be a code that does not already exist anywhere in
  `Menu_Items`. Zomato-style codes are numbers like `"760607587"` — if you
  don't have a real Zomato code for this item, invent a short unique one
  in the same style as the existing ones (e.g. `"NEW001"`). It must be
  written as a **string**, in quotes.
- `item_id`: a plain number, one higher than the current highest
  `item_id` in the file. Search for `"item_id":` and find the largest
  number.

## 2. Add the image FIRST (see skills/update-item-photo.md for full
   image rules — this is the short version)

Put two files in `public/static/images/product_images/`, named EXACTLY
the `product_code` you picked in step 1:

```
public/static/images/product_images/NEW001.webp   ← required
public/static/images/product_images/NEW001.avif   ← optional but recommended
```

If you skip this, the build still succeeds — the item shows the brand
placeholder image instead (a build-time warning is printed, not an
error). Add the real photo as soon as you have it.

## 3. Append the item to menu.json

Open `menu.json`. Find the closing `]` of the `Menu_Items` array (search
for `],` right after the last item's closing `}`, before `"Combos"`).
Add a comma after the previous item's closing `}`, then insert your new
object before the `]`.

**Before (end of Menu_Items array):**
```json
    {
      "product_code": "760607587",
      "item_id": 32,
      "category": "Pizza",
      "item_name": "Zesty Onion Feast Pizza",
      "display_name": "Zesty Onion Feast Pizza",
      "price": 249,
      "description": "[Regular, 7 inches] ...",
      "status": "available"
    }
  ],
  "Combos": [
```

**After (new item appended, comma added after the previous item):**
```json
    {
      "product_code": "760607587",
      "item_id": 32,
      "category": "Pizza",
      "item_name": "Zesty Onion Feast Pizza",
      "display_name": "Zesty Onion Feast Pizza",
      "price": 249,
      "description": "[Regular, 7 inches] ...",
      "status": "available"
    },
    {
      "product_code": "NEW001",
      "item_id": 33,
      "category": "Pizza",
      "item_name": "Tandoori Paneer Pizza",
      "display_name": "Tandoori Paneer Pizza",
      "price": 259,
      "description": "[Regular, 7 inches] Smoky tandoori-spiced paneer, onions and capsicum on our house base.",
      "status": "available"
    }
  ],
  "Combos": [
```

Required fields, exactly these names (never rename them — they mirror the
Zomato catalogue export):

| Field | Type | Notes |
|---|---|---|
| `product_code` | string | unique, matches the image filename |
| `item_id` | number | unique, one higher than the current max |
| `category` | string | groups items on the menu page — reuse an existing category (e.g. `"Pizza"`, `"Burger"`, `"Fried Rice Bowls"`) unless this is genuinely a new category, which then just appears as a new section automatically |
| `item_name` | string | plain name, no emoji needed |
| `display_name` | string | usually the same as `item_name` |
| `price` | number | whole rupees, no `₹`, no quotes |
| `description` | string | 100% pure veg kitchen — never write "chicken/egg/mutton/fish/prawn/keema" or imply non-veg |
| `status` | string | `"available"` or `"unavailable"` exactly |

Optional fields: `subcategory` (string), `veg` (boolean — omit it; the
site already assumes veg unless the description proves otherwise), and
`image_code` (only needed if the image filename is different from
`product_code` — normally omit it too).

## 4. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`. Check the terminal output for a line
like:
```
[menu] no image found for code NEW001 — using brand placeholder
```
If you see that and you DID add the image files, double-check the
filename matches `product_code` exactly (case-sensitive) and that the
files are in `public/static/images/product_images/`, not `public/images/`
or `static/images/`.

If the build fails instead:
```
Invalid data — fix these fields and rebuild:
  • menu.json → Menu_Items.32.product_code: ...
```
the message names the array index and field — fix that field. Still
stuck → `skills/troubleshoot-build.md`.

## 5. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/add-menu-item origin/develop
# ... add image files, edit menu.json ...
npm run build
git add menu.json public/static/images/product_images/NEW001.webp public/static/images/product_images/NEW001.avif PROGRESS.md
git commit -m "feat(menu): add Tandoori Paneer Pizza"
git push -u origin feature/add-menu-item
```
Then merge per `skills/release-manager.md` §5.

## 6. Editing from a phone (GitHub web editor)

Images can't be drag-dropped from the JSON editor, so do this in two
passes on the same branch:

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`, navigate
   into `public/static/images/product_images/`.
2. Tap **Add file → Upload files**, upload your `NEW001.webp` (and
   `.avif` if you have one — see `skills/update-item-photo.md` for how to
   make one). Commit to a **new branch**, e.g. `add-menu-item`.
3. Go back to the repo root, open `menu.json`, tap the pencil icon.
4. Switch to the SAME branch you just created (there's a branch picker
   above the file), then paste in the new item object as shown in step 3
   above.
5. Commit to that same branch, then open **Pull requests → Compare &
   pull request**.
6. Check the "Checks" tab after ~1–2 minutes: green = safe to merge.
