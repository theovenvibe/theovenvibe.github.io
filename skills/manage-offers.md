# Skill: manage-offers

Running, checking and stopping item offers. Read this before touching
`item_offers` — two of the five bugs found on 25 Aug 2026 came from getting
these details wrong.

## What an offer is

A row in the backend's `item_offers` table. The website reads them through
`/availability` and shows the old price struck through beside the new one. The
Worker also blocks Dough from being spent on an item while its offer runs.

`product_code` is the PRIMARY KEY, so **one item can only ever hold one offer** —
stacking is impossible by construction, nothing to check.

**Add-ons and drinks cannot take an offer.** The admin says it best: a bottle is
sold at MRP, and an add-on is really a discount on the dish it sits on.

## Timestamps — the trap that cost an hour

**Always ISO-8601 with the `T` separator.** The code compares timestamps as
strings against `new Date().toISOString()`.

```bash
# CORRECT
python3 -c "import datetime;print(datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z'))"
# 2026-08-25T01:58:56Z

# WRONG — SQLite's datetime() uses a space, and ' ' sorts BEFORE 'T',
# so `ends_at > now` is false and the offer never appears
datetime('now','+21 days')   # 2026-09-15 01:58:56
```

An offer written with the wrong format is invisible with no error anywhere.

## Set an offer

Prefer the admin console — **Growth → Offers** — which handles the timestamps
and the local-time conversion. It also refuses add-ons and drinks for you.

By hand, when setting several at once:

```bash
cd ~/workbench/the-oven-vibe/the-oven-vibe-backend
S=$(python3 -c "import datetime;print(datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z'))")
E=$(python3 -c "import datetime;print((datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=21)).isoformat(timespec='seconds').replace('+00:00','Z'))")
npx wrangler d1 execute oven-vibe --remote --command "
INSERT INTO item_offers (product_code, offer_price, starts_at, ends_at, label, updated_at)
VALUES ('745802364',149,'$S','$E','Chef Special','$S');"
```

**Always set an end date.** An offer that stops on its own cannot be forgotten.

## Verify — three steps, all of them

A row in the table proves nothing on its own.

```bash
# 1. the row exists
npx wrangler d1 execute oven-vibe --remote --command "SELECT product_code,offer_price,ends_at,label FROM item_offers;"

# 2. the website can actually see it — this is the step that catches bad timestamps
curl -s https://oven-vibe-backend.theovenvibe.workers.dev/availability | python3 -c "import json,sys;print(json.dumps(json.load(sys.stdin).get('offers'),indent=1))"

# 3. it renders on both price surfaces
cd ~/workbench/the-oven-vibe/marketing/zomato-scraper
node live-final.mjs      # the calculator
```

⚠️ **Checkout AND the price calculator both show prices.** The calculator was
missed once already. Check both.

⚠️ **Never test this on localhost.** The Worker's CORS allows only the
production origin; on localhost the fetch fails silently and offers appear not
to work. `calc4.mjs` shows how to serve a built page at the real origin.

## Choosing what to discount

The owner's rule, and it is a good one:

> **Discount what is NOT selling and has a good margin. Never discount a best
> seller** — that is a gift on orders you would have got anyway.

Find the candidates:

```bash
# what has actually sold
npx wrangler d1 execute oven-vibe --remote --command "SELECT oi.name, SUM(oi.qty) units FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='completed' GROUP BY oi.name ORDER BY units DESC;"
```

Cross that against margin in `the-oven-vibe-backend/docs/COSTING.md`. The best
candidates sell **zero** and carry **60%+ margin**.

## Pricing an offer

Local sales keep about **95%** (5% Dough earn; spending is blocked on offer
items). Zomato keeps about **60.1%** (27% commission + 18% GST on it + an 8%
ads reserve).

**Price a local offer against the Zomato price, not against your own list.** The
customer is choosing between ordering here and ordering on the app.

- Aim ~25% below the Zomato price — enough to move the order, not a rupee more.
- Every offer should still **earn more than the same item earns on Zomato**.
- Floor: **₹35 profit** on a dish, ₹55 on a combo.

## The two-week review — standing instruction

Two weeks into any offer run, check what has started selling:

```bash
npx wrangler d1 execute oven-vibe --remote --command "SELECT oi.name, SUM(oi.qty) units FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.status='completed' AND o.created_at >= 'YYYY-MM-DD' GROUP BY oi.name ORDER BY units DESC;"
```

**Stop the offer on whichever item has become a best seller.** The offer existed
to revive a dead item; once it sells on its own, the discount is a gift.

```bash
npx wrangler d1 execute oven-vibe --remote --command "DELETE FROM item_offers WHERE product_code='<code>';"
```

Leave the rest running to their end date.

## Currently live

Five offers to **15 September 2026**, labelled "Chef Special". Review **8
September**.

| Item | Code | Was | Offer |
|---|---|---:|---:|
| Herb Paneer Delight Pizza | 745802364 | ₹209 | ₹149 |
| Creamy Alfredo Pasta | 751793935 | ₹209 | ₹149 |
| Crunchy Capsicum Pizza | 745802381 | ₹189 | ₹139 |
| Classic Red Sauce Pasta | 752770847 | ₹189 | ₹129 |
| Korean Spicy Veg Maggi | 760595845 | ₹159 | ₹119 |

All five had sold **zero units** and carry 61–68% margin.
