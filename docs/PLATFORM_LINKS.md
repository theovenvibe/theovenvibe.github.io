# Zomato and Swiggy links on the site

Where they are, where they used to be, and how to put back what was taken out.

## The decision, 2026-08-18

The homepage hero carried two large buttons — **Order on Zomato** and **Order on
Swiggy** — directly beside **See the Menu**. On 18/08 the kitchen's partner-click
alert fired twice in eleven minutes: visitors were arriving on our own site and
tapping straight out to a platform that takes a commission on the same food.

The owner removed them. Nothing is deleted; the markup is commented in place and
reproduced below.

**Why it matters commercially:** a customer on our site is already ours. They
cost nothing to acquire, they pay no platform markup, we keep the whole ticket,
and we get their number for push. The same customer sent to Zomato is a
commission, a slower kitchen ticket, and a customer the platform owns. The
platforms are worth having for people who would never have found us — not for
people already standing at our own front door.

## What was removed

From `src/pages/index.astro`, inside `<div class="hero-actions">`:

```astro
<a href={LINKS.zomato} target="_blank" class="btn btn-zomato btn-lg">Order on Zomato</a>
<a href={LINKS.swiggy} target="_blank" class="btn btn-swiggy btn-lg">Order on Swiggy</a>
```

`See the Menu` stays `btn-secondary`. It was tried as `btn-primary` — it is the
only button in that row now — but the hero already has a red primary just above
it (*Check your exact total & Order Now*), and two stacked red buttons compete
instead of leading. The ordering button stays the only primary on the screen.

## How to put them back

Uncomment the two `<a>` lines and move them back inside `hero-actions`.
**Nothing else needs to change** — all the supporting pieces
were deliberately left alone:

| Piece | Where | State |
|---|---|---|
| `LINKS.zomato`, `LINKS.swiggy` | `src/lib/seo.ts` | Untouched, still exported |
| `.btn-zomato`, `.btn-swiggy` styles | `src/styles/global.css` | Untouched |
| Partner-click alerts | `src/components/PartnerClickAlerts.astro` | Still live on every page |

The commented block in `index.astro` carries the same two lines verbatim, so the
fastest restore is to uncomment them there.

## Where they live now: out-of-range checkout only

Added 2026-08-18, same day, owner's idea — and it is the sharper version of the
same principle.

Beyond `maxDeliveryKm` the quote cannot be sent at all: `pricing.ts` returns
`kind: 'beyond'` and `order-form.ts` leaves **Copy quote** and **Send order on
WhatsApp** inert. That left a dead end at the exact moment someone was ready to
order. **Order on Zomato** and **Order on Swiggy** now take their place there.

Same buttons, opposite meaning. On the homepage the customer was already ours
and the buttons gave them away. Out of range they were never ours to lose — we
cannot cook for that address — so the platforms are a service, not a leak.

- Markup: `src/components/OrderQuote.astro`, `#beyondActions`, `hidden` by
  default. Shared by `/checkout/` and `/price-calculator/`.
- Toggle: `showBeyondActions()` in `src/lib/order-form.ts`. It **replaces** the
  send pair rather than sitting beside it — two greyed buttons next to two live
  ones is a puzzle, not a choice.
- Every path that kills the send buttons also puts the platform pair away,
  including the ones that never reach `renderOutput` (empty basket, closed
  kitchen). Otherwise emptying the basket after an out-of-range quote left
  "Order on Zomato" sitting under "Add items above to see your total".
- The partner-click alert covers these automatically: it matches on hostname,
  not on a CSS class. Alerts from here are the *good* kind — they mean the
  handoff we chose is working.

## Where these links still appear, on purpose

Removing every mention would be the wrong call — some of these serve a customer
we cannot serve ourselves, and two of them are SEO, not a call to action.

| Where | What it is | Why it stayed |
|---|---|---|
| Homepage delivery banner | Text: "Beyond {maxDeliveryKm} km: order on Zomato or Swiggy" | Not a button. Someone outside our delivery radius is a customer we genuinely cannot take — the alternative for them is nothing at all. |
| `src/components/Footer.astro` | Small text links, with UTM tags | Footer, not hero. Low intent: people who scroll to the bottom looking for us on a platform are usually checking we are real. |
| `src/pages/sundargarh.astro` | "Prefer to pay online? We are also on Zomato" | This page targets search traffic that has not chosen us yet, and online payment is a real objection we cannot answer ourselves. |
| `src/pages/faq.astro`, blog posts | Prose mentions | Answering a question honestly, not selling. |
| `restaurantJsonLd` `sameAs` | `src/lib/seo.ts` | Structured data for Google. Never rendered as a link; removing it would weaken the entity, not the funnel. |

**If the alerts keep firing after this change**, the source is one of the rows
above — the footer is the most likely. The alert does not say which link was
tapped; if it becomes worth knowing, add the source to the beacon in
`PartnerClickAlerts.astro` rather than guessing.

## The related number

`stock_moves.channel` in the backend (migration 0018) records whether each used
pizza base went to our own order, Zomato or Swiggy. That is the honest measure
of whether this change moved anything: watch the split in the admin's Stock tab
over the next few weeks.
