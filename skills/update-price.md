# Skill: update-price

Change the price of one menu item, combo, or add-on. One number, one file.

## 1. Open the file

`menu.json` (repo root — NOT inside `src/` or `public/`).

## 2. Find the item

Prices live in three arrays in `menu.json`:
- `Menu_Items` → field `price` (single items, e.g. pizzas, burgers)
- `Combos` → field `combo_price`
- `Add_ons` → field `addon_price`

Search the file for the item's name (`item_name` or `display_name`) or its
code (`product_code` / `combo_code` / `addon_code`). Example: to change
"Veg Fried Rice", search for `"item_name": "Veg Fried Rice"` — the `price`
field is a few lines below it, inside the same `{ ... }` object.

## 3. Make the exact edit

Change ONLY the number. Do not touch quotes, commas, or any other field.

**Before:**
```json
{
  "product_code": "751393909",
  "item_id": 1,
  "category": "Fried Rice Bowls",
  "item_name": "Veg Fried Rice",
  "display_name": "Veg Fried Rice",
  "price": 179,
  "description": "...",
  "status": "available"
}
```

**After (price changed 179 → 199):**
```json
{
  "product_code": "751393909",
  "item_id": 1,
  "category": "Fried Rice Bowls",
  "item_name": "Veg Fried Rice",
  "display_name": "Veg Fried Rice",
  "price": 199,
  "description": "...",
  "status": "available"
}
```

Rules for the number:
- Whole number only (rupees). No `₹`, no quotes, no decimals.
- Must be greater than 0.
- Combo prices use the field `combo_price`; add-on prices use `addon_price` —
  same rules, different field name.

## 4. Verify

```bash
npm run build
```

Expect: `Result (N files): 0 errors`. This regenerates the price everywhere
it appears (menu page, home page, JSON-LD structured data) — there is
nothing else to edit.

If it fails → read the error message, then open `skills/troubleshoot-build.md`.
A price typo (e.g. `"price": "179"` with quotes, or `"price": 17.9`) produces
an error naming `menu.json` and the exact field, like:
```
Invalid data — fix these fields and rebuild:
  • menu.json → Menu_Items.0.price: price must be a whole number of rupees
```

## 5. Commit and ship

Follow `skills/release-manager.md` end to end (branch → verify → commit →
merge to develop). Short version:

```bash
git status --short                              # must be clean first
git fetch origin develop --quiet
git checkout -b feature/update-price origin/develop
# ... make the edit above ...
npm run build                                    # must pass
git add menu.json PROGRESS.md
git commit -m "fix(menu): update Veg Fried Rice price to 199"
git push -u origin feature/update-price
```
Then merge per `skills/release-manager.md` §5 (or open a PR if you want
Milan to review the diff first).

## 6. Editing from a phone (GitHub web editor)

No computer needed — this works from any phone browser:

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. Tap `menu.json` in the file list to open it.
3. Tap the pencil icon (top right of the file view) to edit.
4. Find the item, change the `price` number only.
5. Scroll to the bottom → under "Commit changes", pick **"Create a new
   branch for this commit and start a pull request"**. Give the branch a
   name like `update-price`.
6. Tap **Propose changes**, then **Create pull request**.
7. Wait ~1–2 minutes, then open the "Checks" tab on the PR. If it shows a
   green check, the build passed. If it shows a red X, tap it to read the
   error, fix the number, and commit again on the same branch.
8. Once green, merge the PR into `develop` (or ask Milan to).

If the edit is malformed, the build fails on the branch/PR and the LIVE
SITE IS UNAFFECTED — nothing broken ever reaches production from this flow.
