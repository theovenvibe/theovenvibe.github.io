# MEMORY.md

Durable notes for this repo. Read before touching `menu.json`.

## What this repo is

The public site for The Oven Vibe, served from `main` via GitHub Pages.
`menu.json` is the single source of the menu — `public/scripts/site.js` reads it.
Prices here are the **local menu prices**, not Zomato prices. Zomato runs its own
higher price list (roughly 1.5× on mains, at parity on sides as of Aug 2026).

## Editing menu.json

- **The file uses CRLF line endings.** Writing it with LF rewrites all 900 lines
  and buries the real change. Any script that rewrites it must emit `\r\n`.
- Keep `product_code` / `combo_code` / `addon_code` stable — they are the join
  keys to the Zomato catalogue and to `items_included` on combos.
- A combo's `items_included` must only reference surviving `product_code`s.
  Dropping an item means checking every combo that points at it.
- After any edit: validate the JSON and confirm the diff touches only the lines
  you meant to change.

## Pricing rules (Aug 2026 revision)

Set from demand data in the analytics dashboard — units, menu quadrant and
attach rate over Mar–Aug 2026. Full reasoning lives in
`../the-oven-vibe-dashboard/docs/PRICING_STRATEGY.md`.

- **Three anchor prices never move**: Zesty Onion Feast Pizza ₹129, Classic
  French Fries ₹99, Tangy Green Chutney Sandwich ₹89. They are 7% of volume and
  they set price perception for the whole menu.
- **Tiers**: bestsellers +₹10 (four pizzas = 65% of units, so small steps only),
  mid-tail +₹10–20, impulse/add-ons +₹20, dormant +₹20.
- **Combos price at ~10% off the sum of their parts**, ₹9-ending, and must sit
  at least ₹40 above their own main item's solo price. A combo that undercuts
  the dish it contains kills the à-la-carte sale. 15–17% is a promotion, not a
  standing price.
- A "one item + drink" bundle can never discount more than the drink is worth —
  that structure is why the two rice meal boxes never sold. Combos need a main
  plus a side to work.
- The Coke in combos is assumed at ₹40; it is not a priced SKU in this file.

## Menu decisions

- **Aug 2026 — wok station retired.** Gas price rise and shortage forced the cut.
  Dropped: all five fried rice SKUs, both rice meal-box combos, Creamy Cheese
  Maggi, Tangy Masala Corn, Cheesy Corn Mix, Motu Burger (never ordered, never on
  the printed menu). Kept Classic Red Sauce Pasta by owner's call despite low
  volume.
- New SKUs must be **oven, griddle or fryer only** — no wok, no long boil — until
  gas economics change.
- Under review, not yet added: Small Fries ₹59 (attach driver), Midnight Pizza
  Box ₹249 locally (top-selling combo on Zomato, absent here), Cheese Pizza +
  Fries combo ₹279, a ₹299 premium pizza as the top rung.

## Keep in sync

`menu.json` prices, the printed menu, the Zomato catalogue and
`../the-oven-vibe-dashboard/data/menu.csv` are four copies of the same facts.
Change one, change all four.
