# Skill: update-delivery-charges

Change delivery slab pricing, the free-delivery threshold, or the delivery
radius note. All of it lives in one place: `site.config.json`, never
inside a page component.

## 1. Open the file

`site.config.json` (repo root). Find the `"delivery"` object.

## 2. Current shape

The approved delivery policy is in `docs/DELIVERY_PRICING.md`. The current
config has three contiguous slabs: 0–2 km ₹39, 2–4 km ₹79 and 4–6 km ₹119.
The slabs have `free_above` thresholds of 499, 899 and 1299 respectively;
these are inclusive during normal hours. There are no minimum-order or afternoon-rate
fields. Late night uses the same slab charges plus one `kitchen_charge: 50`.

## 3. What each field controls

| Field | What it changes | Example edit |
|---|---|---|
| `hook` | The short marketing line shown near CTAs | `"Delivery starts at just ₹35"` |
| `slabs[].charge` | The rupee amount for that distance band | `29` → `35` |
| `slabs[].label` | The distance band text | `"0–2 km"` |
| `slabs[].free_above` | Inclusive free-delivery threshold for that band | `899` → `999` |
| `radius_note` | The delivery-area sentence on `/sundargarh/` and elsewhere | `"We deliver up to 6 km..."` |

**Adding or removing a slab:** `slabs` is a list — add a new
`{ "label": "...", "charge": ... }` object (comma-separated) or delete one
entirely, following the same JSON list-editing rules as
`skills/add-menu-item.md` step 3. At least one slab must remain.

## 4. Keep the policy and all customer surfaces aligned

A distance-band change also affects the shared order form and the Worker admin's
distance correction. Follow `docs/DELIVERY_PRICING.md`, update the band radios
in `src/components/OrderOptions.astro`, and run the delivery test matrix. Do not
add a separate late-night delivery table or a minimum-order field.

## 5. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`.

Validation rules (what fails the build):
- `slabs[].charge` must be a whole number, 0 or more.
- `free_above` must be a whole positive number.
- `hook` and `radius_note` must not be empty strings.

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
3. Edit the `delivery` block and update the current policy documentation.
4. Scroll down → "Commit changes" → **"Create a new branch for this
   commit and start a pull request"** → **Propose changes** → **Create
   pull request**.
5. Check the "Checks" tab after ~1–2 minutes: green = safe to merge.
