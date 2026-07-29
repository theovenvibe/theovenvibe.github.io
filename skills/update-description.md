# Skill: update-description

Change the name or description text of one menu item, combo, or add-on.

## 1. Open the file

`menu.json` (repo root).

## 2. Find the item

Search for the item by its current name (`item_name`, `display_name`,
`combo_name`, or `addon_name`). The text fields you can edit:

| Array | Name field | Description field |
|---|---|---|
| `Menu_Items` | `item_name`, `display_name` | `description` |
| `Combos` | `combo_name` | `description` |
| `Add_ons` | `addon_name` | (no description field) |

## 3. Make the exact edit

Edit only the text inside the quotes. Keep the quotes. Keep the comma at
the end of the line if there was one.

**Before:**
```json
{
  "product_code": "751393909",
  "item_name": "Veg Fried Rice",
  "display_name": "Veg Fried Rice",
  "price": 179,
  "description": "[Veg preparation] Fluffy wok tossed basmati rice with crunchy carrots, beans and sweet corn.",
  "status": "available"
}
```

**After (description reworded):**
```json
{
  "product_code": "751393909",
  "item_name": "Veg Fried Rice",
  "display_name": "Veg Fried Rice",
  "price": 179,
  "description": "[Veg preparation] Wok-tossed basmati rice with carrots, beans, sweet corn and a hint of black pepper.",
  "status": "available"
}
```

Important — do NOT delete markers like `[Veg preparation]`, `[Regular, 7
inches]`, or `[25 g]` from the START of `description`. `menu.json` mirrors
the Zomato catalogue and these markers carry real information (size, spice
level) that the website reads and displays separately — see
`src/lib/data.ts` → `displayMeta()`. It is safe to reword the sentence
AFTER the bracket. If you genuinely need to change the size/weight/spice
info itself, edit the text inside the `[...]` brackets, keeping the
brackets.

Rules:
- `item_name` / `display_name` / `combo_name` / `addon_name`: plain text,
  at least 1 character. Emoji are fine to leave in (the site strips them
  automatically at display time — see AGENTS.md golden rule #7) but there
  is no need to add new ones; the site is emoji-free by design.
- Never write "non-veg", "chicken", "egg", "mutton", "fish", "prawn", or
  "keema" into any name or description — the kitchen is 100% pure veg
  (AGENTS.md golden rule #6). If a word like that appears in an old entry,
  removing it is correct, not a bug.
- `description` must not be empty.

## 4. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`.

If it fails, the error names the exact field:
```
Invalid data — fix these fields and rebuild:
  • menu.json → Menu_Items.0.description: String must contain at least 1 character(s)
```
Fix it, then open `skills/troubleshoot-build.md` if you're still stuck.

## 5. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/update-description origin/develop
# ... make the edit ...
npm run build
git add menu.json PROGRESS.md
git commit -m "feat(menu): reword Veg Fried Rice description"
git push -u origin feature/update-description
```
Then merge per `skills/release-manager.md` §5.

## 6. Editing from a phone (GitHub web editor)

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. Open `menu.json`, tap the pencil icon to edit.
3. Find the item, change the name/description text (keep the `[...]`
   markers if present).
4. Scroll down → "Commit changes" → **"Create a new branch for this commit
   and start a pull request"**.
5. Tap **Propose changes** → **Create pull request**.
6. Check the PR's "Checks" tab after ~1–2 minutes: green = safe to merge,
   red = tap it, read the error, fix, and commit again on the same branch.

A malformed edit fails the build on the branch — the live site keeps
serving the last good version, always.
