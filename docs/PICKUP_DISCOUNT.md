# The pickup discount — retired 2026-08-19, and how to bring it back

It was **₹30 off pickup orders over ₹299**. It is commented out, not deleted.

## Why it went

The theory was that a pickup saves us the ride, so the saving should be shared.
The arithmetic says the saving mostly does not exist.

**On a 0–2 km delivery we collect a ₹29 fee and burn about ₹11 of petrol, so
delivering is ₹18 better for us than the same order collected.**

| Basket | If delivered, we keep | If picked up, we keep | Pickup is worth |
|---:|---:|---:|---:|
| ₹299 | ₹197 | ₹179 | **−₹18** |
| ₹399 | ₹257 | ₹239 | **−₹18** |
| ₹499 | ₹288 | ₹299 | **+₹11** |
| ₹999 | ₹588 | ₹599 | **+₹11** |

Below ₹499 we were **paying ₹30 for the privilege of losing ₹18** — a ₹48 swing
against us versus delivering the same food. Only above ₹499, where delivery is
already free, does a pickup genuinely save anything, and that is **₹11**: too
small to change anybody's behaviour.

Stacked with Dough it was worse. A ₹299 pickup with the discount and a ₹29 Dough
spend left the customer paying ₹240 against ₹120 of food — **50% food cost**, the
thinnest thing we sell.

**And Dough replaces it.** A pickup customer already earns 5% back — ₹15 on a
₹299 order, half the old discount, costing nothing today, and it brings them
back rather than just being cheaper once.

## The one argument for keeping it

The ₹30 may be part of why anyone chooses pickup at all, and a pickup is an
order nobody has to ride out for. That is real — but at −₹18 below ₹499 we would
rather they took delivery, so the convenience was not worth buying.

## How to switch it back on

Three files. Nothing was deleted and the config keys are untouched.

**1. `src/lib/pricing.ts`** — in the pickup branch, two commented blocks:

- Restore `pickupNudge` (delete the `const pickupNudge … = undefined;` line and
  uncomment the block above it)
- Restore the `} else if (subtotal >= cfg.pickup_min_order) {` discount line
  below it

**2. `src/components/OrderOptions.astro`** — the radio label:

```astro
Pickup (₹{d.pickup_discount} off over ₹{d.pickup_min_order})
```

**3. `src/pages/price-calculator.astro` and `src/pages/faq.astro`** — restore the
sentences that promise it.

**Then:** `npm run build`, check a ₹299 pickup shows the discount line, and open
a PR as usual.

**Values live in `site.config.json`**: `delivery.pickup_discount` (30) and
`delivery.pickup_min_order` (299). If it comes back, consider **₹10 above ₹499**
instead — that is the only band where the saving is real.
