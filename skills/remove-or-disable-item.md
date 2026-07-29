# Skill: remove-or-disable-item

Hide a menu item, combo, or add-on (temporarily out of stock, seasonal,
discontinued) WITHOUT deleting its data. Use the `status` flag — never
delete the JSON object itself unless Milan explicitly says "delete this
item forever".

## 1. Open the file

`menu.json` (repo root).

## 2. Find the item

Search for the item by name or code, in whichever array it lives in:
`Menu_Items`, `Combos`, or `Add_ons`. Every object in all three arrays has
a `status` field.

## 3. Make the exact edit

Change `status` from `"available"` to `"unavailable"`. Nothing else.

**Before:**
```json
{
  "product_code": "751393909",
  "item_name": "Veg Fried Rice",
  "price": 179,
  "description": "...",
  "status": "available"
}
```

**After (item hidden from the site):**
```json
{
  "product_code": "751393909",
  "item_name": "Veg Fried Rice",
  "price": 179,
  "description": "...",
  "status": "unavailable"
}
```

What this does: `src/lib/data.ts` builds `availableItems` /
`availableCombos` / `availableAddons` by filtering out anything whose
`status` is not `"available"`. An unavailable item disappears from the
menu page, the home page, and the JSON-LD `Menu` structured data — but its
data stays in `menu.json`, so bringing it back later is just flipping
`status` back to `"available"`.

To bring an item BACK: find it, change `"unavailable"` → `"available"`,
verify, commit. That's the whole "un-hide" skill.

### If a combo references a hidden item

If you set a `Menu_Items` entry to `"unavailable"` and a combo in `Combos`
still lists its `product_code` in `items_included`, the combo keeps
showing (combos aren't automatically hidden when their ingredients are)
but now advertises an item that's off the menu. Either:
- also set that combo's `status` to `"unavailable"`, or
- edit `items_included` to remove that code (only if the combo still
  makes sense without it — ask Milan if unsure, don't guess).

### Permanent deletion (rare — only if Milan says "delete forever")

Delete the entire `{ ... }` object for that item from its array, including
the trailing comma if it was the last property before the item, or the
comma of the item BEFORE it if this item was last in the array. Getting a
comma wrong here is the #1 way this edit breaks — when in doubt, use
`status: "unavailable"` instead, it is always reversible and always safe.

## 4. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`.

If a combo now references a `product_code` that no longer exists (because
you deleted the item instead of disabling it), the build fails with:
```
Invalid data — fix these fields and rebuild:
  • menu.json → Combos.2.items_included: Combo "Veg Fried Rice Meal Box Combo" references product_code 751393909, which does not exist in Menu_Items
```
Fix by either restoring the item, setting the combo to `unavailable` too,
or removing the code from `items_included`. Still stuck →
`skills/troubleshoot-build.md`.

## 5. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/disable-item origin/develop
# ... flip status to "unavailable" ...
npm run build
git add menu.json PROGRESS.md
git commit -m "fix(menu): mark Veg Fried Rice unavailable (out of stock)"
git push -u origin feature/disable-item
```
Then merge per `skills/release-manager.md` §5.

## 6. Editing from a phone (GitHub web editor)

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. Open `menu.json`, tap the pencil icon.
3. Find the item, change `"status": "available"` to
   `"status": "unavailable"` (or back, to re-enable).
4. Scroll down → "Commit changes" → **"Create a new branch for this commit
   and start a pull request"** → **Propose changes** → **Create pull
   request**.
5. Check the "Checks" tab after ~1–2 minutes; green = mergeable.

The live site is never affected by a broken edit on a branch/PR — only a
merge to `develop` (and eventually `main`) changes what customers see.
