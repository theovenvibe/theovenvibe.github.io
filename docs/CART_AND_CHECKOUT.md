# Cart and checkout — how it works

Branch: `feature/cart-and-checkout` (cut from `origin/develop`, 2026-08-15)

Ordering used to mean one of two things: message WhatsApp and describe what you
want, or use `/price-calculator/`, which lists the entire menu as stepper rows.
Neither lets someone browse the menu with its photos and build an order as they
go. This adds that: **Add** on any menu card, a floating basket and a nav
basket, and a `/checkout/` page that prices the basket by exactly the rules the
calculator uses and sends it to the kitchen on WhatsApp.

This unparks the "WA cart-builder", which PRD §8 / Phase 2b parked pending owner
approval. Approved by the owner on 2026-08-15.

## The one rule this design is built around

**There is exactly one implementation of the order form.** `/checkout/` and
`/price-calculator/` ask the customer the same questions, apply the same
late-night and rain and pre-order rules, produce the same message and fire the
same alert. Two copies of those rules would drift, and this repo has spent ten
releases making them right once.

So the split is:

| Where | What lives there |
|---|---|
| `src/lib/pricing.ts` | The arithmetic. Untouched by this work. |
| `src/lib/order-form.ts` | The form's behaviour: slot handling, availability, rain/prepaid interplay, quote text, WhatsApp hand-off, ntfy alert. **Lifted out of `price-calculator.astro`.** |
| `src/components/OrderOptions.astro` | The questions (distance, time, order type, other). |
| `src/components/OrderQuote.astro` | The quote and the two send buttons. |
| `src/lib/data.ts` → `orderCatalog` | What is orderable, and what survives the late-night window. |
| `src/lib/cart.ts` | What the customer picked, in localStorage. |
| The two pages | **Only** where the basket comes from. |

A page supplies a `BasketRow[]`. The calculator's rows are the whole menu with a
stepper each; checkout's rows are the cart. Everything downstream is shared.

## The cart

`localStorage` under `ovenvibe.cart.v2`. It stores **quantities against
catalogue ids and nothing else** — no names, no prices.

Prices are re-read from the current build at render time, so:

- a cart left open overnight cannot quote yesterday's price;
- an item taken off the menu drops out of the basket instead of being ordered
  (the id no longer resolves, and it is cleaned out of storage).

The ids are `item-`/`combo-`/`addon-` plus the catalogue code. MEMORY.md already
pins those codes as stable join keys to Zomato, which is exactly the property a
persisted cart needs: renaming a dish does not orphan a basket.

### Add-ons belong to a line, not to the basket

A basket holding two pizzas and a loose "Extra Cheese" is not an order — the
kitchen has to ring back and ask which pizza. So each line carries its own
extras with their own quantities:

```
Zesty Onion Feast Pizza x2 — ₹258
   + Extra Cheese x1 — ₹39
   + Sweet Corn x2 — ₹50
Ultimate Cheese Delight Pizza x1 — ₹159
```

One line per distinct item. Adding the same pizza twice raises that line rather
than making a second one, so "extra cheese on one of the two" is expressed by
the extra's quantity — which is what a kitchen reads anyway. An add-on ordered
on its own (a dip in a tub) is simply a line of its own, and gets no extras.

Removing a dish removes its extras with it.

## Customer details

`/checkout/` asks for a name and a mobile number (owner request), and offers an
**unticked** opt-in for offers on WhatsApp. Both are remembered in this browser
so a regular does not retype them.

Validation is deliberate: exactly ten digits starting 6–9, accepting `+91` and a
leading `0` and ignoring spaces. Nine digits, eleven digits and a number
starting with 1 are all rejected, because a wrong number is worse than no
number — the kitchen cannot call back.

Until both are valid the send buttons stay shut, **but the total is still
shown**: seeing the price is what the customer came for, and hiding it to
extract a phone number would be a dark pattern.

### The one thing that must never change here

The name and number go into the **WhatsApp message only**. They are deliberately
kept out of the ntfy alert, which is published to a topic anyone who reads the
page source can subscribe to (free ntfy has no access control —
`skills/setup-order-alerts.md`). `order-form.ts` builds the two texts separately
for exactly this reason, and the test suite asserts the customer's name and
number never appear in the alert body.

**This was a real bug during development**, caught by that test: the alert was
publishing the whole quote, which had just grown a phone number. If you add a
field to the order, check it against that test.

## Two pre-existing bugs fixed on the way

1. **`runsMon–Fri`** — a missing space, live on the site since Phase 3. Astro
   deletes a whitespace-only text node spanning a line break between inline
   nodes, the exact trap PROGRESS.md's Phase 3 entry documents.
2. **The distance radio ignored a typed distance.** Typing `3.2` left "Under
   2 km" selected while the quote silently priced the 2–4 km slab. The radio now
   follows the number, and picking a band by hand clears the number.

Both were fixed in the shared component, so both pages got the fix.

## Verification

- `npm run build` green throughout.
- **The calculator was proved unchanged, not assumed to be.** A 15-scenario
  behavioural baseline (standard / quiet hours weekday and Saturday / below
  minimum / free delivery / each distance band / exact km / pickup above and
  below the floor / rain / prepaid-waives-rain / closed / late-night pre-order /
  pre-order standard) was captured from the built page BEFORE the refactor,
  recording the quote text, total, rendered output, time-rule note, availability
  note, button states and the visibility of every conditional control. After the
  refactor: **0 field differences.** Re-run after the catalogue move and again
  after the add-ons work: still 0.
- Screenshots before and after the CSS move: 0.04% of pixels differ at 390px,
  all of it a 1px vertical shift of one line of text; content identical.
- Cart flow, 48 assertions: add from the menu, badge and FAB, persistence across
  pages, editing quantities at checkout, pickup and beyond-range and late-night
  rules, the phone-number gate (9/10/11/12 digits, `+91`, leading `0`, wrong
  prefix), details remembered, emptying, and a stale catalogue id being dropped.
- Add-ons, 21 assertions: an extra attaches to one dish and not the other, keeps
  its own quantity independent of the dish, disappears from the picker once
  added, is charged in the subtotal, is nested under its dish in the message,
  and dies with its dish. Plus: no name and no phone number in the public alert.

## Open

- Owner review of the visible changes (nav basket, floating basket, Add buttons,
  the checkout page).
- See `TODO.md` for what was deliberately left out.
