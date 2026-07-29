# Skill: update-combo

Edit an existing combo (price, name, description, which items it bundles)
or add a brand-new combo. Combos live in the `Combos` array in
`menu.json`, separate from `Menu_Items`.

## 1. Open the file

`menu.json` (repo root). Find the `Combos` array.

## 2. Editing an EXISTING combo

Search for the combo by `combo_name` or `combo_code`. Fields you can
change:

| Field | Type | Notes |
|---|---|---|
| `combo_price` | number | whole rupees, no `₹`, no quotes |
| `combo_name` | string | plain text |
| `description` | string | plain text, no non-veg wording |
| `status` | string | `"available"` / `"unavailable"` — see skills/remove-or-disable-item.md |
| `items_included` | array of strings | `product_code`s this combo bundles — see step 3 |

**Before (price change):**
```json
{
  "combo_code": "752694444",
  "combo_name": "Veg Fried Rice Meal Box Combo",
  "combo_price": 209,
  "description": "Fluffy wok-tossed basmati rice with fresh vegetables, served with a refreshing Coke.",
  "items_included": ["751393909"],
  "image_code": "752694444",
  "status": "available"
}
```

**After (209 → 229):**
```json
{
  "combo_code": "752694444",
  "combo_name": "Veg Fried Rice Meal Box Combo",
  "combo_price": 229,
  "description": "Fluffy wok-tossed basmati rice with fresh vegetables, served with a refreshing Coke.",
  "items_included": ["751393909"],
  "image_code": "752694444",
  "status": "available"
}
```

## 3. `items_included` — every code MUST exist in Menu_Items

`items_included` is a list of `product_code` strings. Every code you list
here must match a real `product_code` somewhere in the `Menu_Items` array
— the build checks this and fails if a code is wrong or misspelled. To
find valid codes, search `Menu_Items` for the item you want to bundle and
copy its `product_code` exactly (including quotes).

## 4. Adding a brand-new combo

Pick a `combo_code` that doesn't already exist (Zomato-style number, or
invent one like `"CMB006"` following the existing pattern). Then add the
image (see step 5) and append a new object to the END of the `Combos`
array, following the exact same shape as step 2's example, with all six
fields: `combo_code`, `combo_name`, `combo_price`, `description`,
`items_included`, `image_code`, `status`. Comma placement rules are the
same as `skills/add-menu-item.md` step 3 — read that if you're unsure how
to insert into a JSON array without breaking it.

## 5. Combo images

`image_code` normally equals `combo_code`. Put the image at:
```
public/static/images/combo_images/<combo_code>.webp   ← required
public/static/images/combo_images/<combo_code>.avif   ← optional
```
Full image rules (sizing, background, format): `skills/update-item-photo.md`.

## 6. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`.

Common combo-specific error:
```
Invalid data — fix these fields and rebuild:
  • menu.json → Combos.0.items_included: Combo "Veg Fried Rice Meal Box Combo" references product_code 999999999, which does not exist in Menu_Items
```
This means a code in `items_included` is wrong — go find the correct
`product_code` in `Menu_Items` and fix the typo. Still stuck →
`skills/troubleshoot-build.md`.

## 7. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/update-combo origin/develop
# ... edit menu.json (+ add image files if new combo) ...
npm run build
git add menu.json PROGRESS.md
git commit -m "fix(menu): raise Veg Fried Rice Meal Box Combo price to 229"
git push -u origin feature/update-combo
```
Then merge per `skills/release-manager.md` §5.

## 8. Editing from a phone (GitHub web editor)

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. (New combo only) Upload the image first under
   `public/static/images/combo_images/`, committing to a new branch.
3. Open `menu.json` on that same branch, tap the pencil icon.
4. Find the `Combos` array, make your edit (or append the new object).
5. Scroll down → "Commit changes" → **"Create a new branch for this
   commit and start a pull request"** (or commit to the branch you already
   made in step 2) → **Propose changes** → **Create pull request**.
6. Check the "Checks" tab after ~1–2 minutes: green = safe to merge.
