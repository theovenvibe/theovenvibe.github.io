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

## The pickup discount needs a floor

₹30 off applies only from **₹299** up. At 15% margin a ₹100 order contributes
about ₹15, so ₹30 off it is a ₹15 loss — break-even is ₹200. ₹299 clears that
and still fires on roughly half of all orders. A higher gate was considered and
rejected: at ₹399 only 18% of orders qualify, so the discount would rarely
trigger and stop pulling anyone away from a delivery that costs the kitchen ₹78
a ride. The discount never applies during the late-night window.

## Rain, and why prepaying locks the price

Rain is the one charge that can appear *after* the quote, so it has three cases
and only one of them is a tick box:

- **Ordering now, delivery** — "It's raining right now (+₹29)" is tickable.
- **Ordering for later** — nobody knows the weather yet, so the box is hidden and
  replaced by a plain line: if it rains when we ride out, ₹29 is added on delivery.
- **Paid online** — no rain charge, ever. Asking someone who already paid on the
  QR for another ₹29 at the door is not worth the review it earns, and a
  confirmed prepaid order is worth more to the kitchen than the ₹29.

Pickup never carries it: no ride, no charge.

The pre-order discount (₹10 for ordering ahead) was removed — it paid people for
saying "later" with no commitment. Prepaying now buys a locked price instead,
which costs nothing when it isn't raining and buys a confirmed order when it is.

## Kitchen hours and what they mean in code

The calculator has three states, driven by `site.config.json` and verified on
the built page, not assumed:

- **Open** (11:30–23:30): everything available, standard or afternoon pricing.
- **Late night** (23:30–**02:00**): ₹399 minimum, prepaid, and two separate
  charges — **₹49 kitchen** on every order including pickup (the oven is fired
  either way) and **₹30 delivery premium** on top of the normal distance fee.
  The usual ₹30 pickup discount does not apply in the window, so late night adds
  ₹79 to an order whichever way it travels. Free delivery is switched off here
  too: the ride costs more at 1am, not less. The boiling stations are shut, so
  pasta, maggi and the Pasta Treat Combo grey out.
  Set by `late_night.unavailable_categories` / `unavailable_items`; anything not
  named there stays available. A combo is only orderable if the items inside it
  are.
- **Closed** (02:00–11:30): every item greys out and the page says "Kitchen is
  closed — we open at 11:30 AM" instead of producing a total. Quoting an order
  the kitchen cannot cook is worse than quoting nothing.

Late night deliberately wins over opening hours, because the window starts at
closing time — that overlap is intended, not a bug.

## Data blind spot — read before trusting any number

The analytics dashboard sees **Zomato orders only**. Direct WhatsApp and phone
orders are not recorded anywhere, and Zomato's listing closes with the kitchen,
so the entire late-night and pickup trade is invisible to it. This has already
distorted three analyses: the regulars policy (no way to identify a regular),
the delivery-band picture, and a late-night recommendation that was withdrawn
after the owner pointed out that real late orders average ₹400–500, not the
₹232 the Zomato tail suggested. Logging direct orders is the highest-value data
fix available.

## Menu decisions

- **Aug 2026 — wok station retired, menu cut from 32 SKUs to 18.** Gas price
  rise and shortage forced the cut. Dropped: all five fried rice SKUs, both rice
  meal-box combos, Creamy Cheese Maggi, Tangy Masala Corn, Cheesy Corn Mix,
  Motu Burger (never ordered, never on the printed menu), the three sandwich
  experiments that did not work (Dahi Tadka, Khatti Meethi Imli Khajoor, Chilli
  Peanut Thecha), Chilli Garlic Potato Pops and Cheese Onion Crispy Pocket
  Bombs. Kept Classic Red Sauce Pasta by owner's call despite low volume.
- What remains: 8 pizzas, 2 pastas, 3 sandwiches, 1 maggi, 4 sides, 3 combos,
  6 add-ons. Sides are now Classic Fries ₹99, Peri Peri Fries ₹129, Garlic Bread
  Toast ₹129, Peri Makhana ₹129 — fries carry the whole attach opportunity, so
  do not drop either without a replacement side.
- New SKUs must be **oven, griddle or fryer only** — no wok, no long boil — until
  gas economics change.
- Under review, not yet added: Small Fries ₹59 (attach driver), Midnight Pizza
  Box ₹249 locally (top-selling combo on Zomato, absent here), Cheese Pizza +
  Fries combo ₹279, a ₹299 premium pizza as the top rung.

## Keep in sync

`menu.json` prices, the printed menu, the Zomato catalogue and
`../the-oven-vibe-dashboard/data/menu.csv` are four copies of the same facts.
Change one, change all four.
