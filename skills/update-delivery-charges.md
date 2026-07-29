# Skill: update-delivery-charges

Change delivery slab pricing, the free-delivery threshold, or the delivery
radius note. All of it lives in one place: `site.config.json`, never
inside a page component.

## 1. Open the file

`site.config.json` (repo root). Find the `"delivery"` object.

## 2. Current shape (for reference — yours may have different numbers)

```json
"delivery": {
  "hook": "Delivery starts at just ₹29",
  "slabs": [
    { "label": "0–2 km", "charge": 29 },
    { "label": "2–4 km", "charge": 59 },
    { "label": "4–8 km", "charge": 99 }
  ],
  "free_above": 599,
  "free_above_note": "FREE delivery on orders above ₹599 (within 0–8 km)",
  "radius_note": "We deliver within 8 km of Sundargarh town. Also on Zomato & Swiggy."
}
```

## 3. What each field controls

| Field | What it changes | Example edit |
|---|---|---|
| `hook` | The short marketing line shown near CTAs | `"Delivery starts at just ₹35"` |
| `slabs[].charge` | The rupee amount for that distance band | `29` → `35` |
| `slabs[].label` | The distance band text | `"0–2 km"` |
| `free_above` | The rupee threshold for free delivery | `599` → `699` |
| `free_above_note` | The sentence shown for the free-delivery rule | keep it consistent with `free_above` — see step 4 |
| `radius_note` | The delivery-area sentence on `/sundargarh/` and elsewhere | `"We deliver within 8 km..."` |

**Adding or removing a slab:** `slabs` is a list — add a new
`{ "label": "...", "charge": ... }` object (comma-separated) or delete one
entirely, following the same JSON list-editing rules as
`skills/add-menu-item.md` step 3. At least one slab must remain.

## 4. IMPORTANT — keep free_above and free_above_note in sync

If you change `free_above` from `599` to `699`, also update
`free_above_note` to say `699`, e.g.
`"FREE delivery on orders above ₹699 (within 0–8 km)"`. These are two
separate text fields — the build does NOT auto-generate one from the
other, so a mismatch here is a silent content bug, not a build error.

**Before:**
```json
"free_above": 599,
"free_above_note": "FREE delivery on orders above ₹599 (within 0–8 km)",
```

**After (raised to 699):**
```json
"free_above": 699,
"free_above_note": "FREE delivery on orders above ₹699 (within 0–8 km)",
```

## 5. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`.

Validation rules (what fails the build):
- `slabs[].charge` must be a whole number, 0 or more.
- `free_above` must be a whole positive number.
- `hook`, `free_above_note`, `radius_note` must not be empty strings.

Example error:
```
Invalid data — fix these fields and rebuild:
  • site.config.json → delivery.slabs.1.charge: slab charge must be 0 or more rupees
```
Still stuck → `skills/troubleshoot-build.md`.

## 6. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/update-delivery-charges origin/develop
# ... edit site.config.json ...
npm run build
git add site.config.json PROGRESS.md
git commit -m "fix(config): raise free-delivery threshold to 699"
git push -u origin feature/update-delivery-charges
```
Then merge per `skills/release-manager.md` §5.

## 7. Editing from a phone (GitHub web editor)

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. Open `site.config.json`, tap the pencil icon.
3. Edit the `delivery` block (remember step 4's free_above/free_above_note
   pairing).
4. Scroll down → "Commit changes" → **"Create a new branch for this
   commit and start a pull request"** → **Propose changes** → **Create
   pull request**.
5. Check the "Checks" tab after ~1–2 minutes: green = safe to merge.
