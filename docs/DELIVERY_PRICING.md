# Delivery pricing — current policy (2026-09-28)

`site.config.json` → `delivery.slabs` is the source of truth. `src/lib/pricing.ts`
computes the quote for both `/price-calculator/` and `/checkout/`. Both pages
use `src/lib/order-form.ts`; checkout receives the basket and chosen conditions
from the calculator. The Worker stores the quoted total and fetches the published
slabs when the owner corrects a distance. It does not independently price orders.

| One-way distance | Standard delivery | Free from (inclusive) |
|---|---:|---:|
| 0–2 km | ₹39 | ₹499 |
| More than 2 km, up to 4 km | ₹79 | ₹899 |
| More than 4 km, up to 6 km | ₹119 | ₹1299 |
| More than 6 km | Zomato or Swiggy | — |

Exactly 2, 4 and 6 km belong to the lower band. No distance or late-night
minimum order exists. The retired weekday afternoon rate does not apply.

During normal hours, delivery is free at ₹499 or more of food in the 0–2 km
band, ₹899 or more in the 2–4 km band, and ₹1299 or more in the 4–6 km band.
All thresholds are inclusive. The owner approved the outer-band thresholds
during local preview review. Free delivery does not apply late at night;
rain and other applicable surcharges remain separate.

From 11:30 PM through 2:00 AM, delivery uses the same distance rate. A single
₹50 kitchen reopen surge applies once per order, including pickup. The full
final payable total must be received before the owner accepts the order.
The site has no payment gateway: checkout hands the quote to WhatsApp, the
kitchen sends its payment QR, and the Worker admin requires the owner to enter
the exact received amount before accepting a late-night order. A customer
checkbox cannot mark an order paid.
An increase to an already accepted late-night bill also requires the owner
to verify receipt of the revised full total, including when undoing a correction.
Owner WhatsApp bills recover the captured kitchen/rain components from the
original quote; historical charges are never silently replaced with today's fees.

Active rain adds ₹29 once to delivery, including late-night delivery. It never
applies to pickup. For a late-night pre-order, the kitchen confirms the final
total including any active rain charge and collects it before preparing food.
The existing rule that normal prepaid orders waive a later rain charge remains.

The delivery-charge cap was removed because it would reduce a 4–6 km late-night
rain order below the promised ₹119 + ₹50 + ₹29 charges. Dough may still reduce
eligible food according to its own 10% cap; it has no delivery minimum to obey.

## QA before review

Run `npm run build`, `npm run test:delivery`, `npm run test:dough`, and
`skills/qa-check.md`. Preview the built site and compare calculator and checkout
for the same basket, distance, time and rain state. The owner reviews that local
preview before either repository merges or deploys.
