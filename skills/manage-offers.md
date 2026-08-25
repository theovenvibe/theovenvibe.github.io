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

### ⚠️ That query alone will mislead you

D1 holds **website orders only** — seven of them as of 25 Aug. Against that
sample every item looks dead, including the best-selling dish in town.

**Always check Zomato history too**, where the real customers are:
`marketing/findings/data/zomato-orders-2026-03-to-2026-08.json` (260 delivered
orders), summarised in `findings/2026-08-13-menu-demand-and-quality.md`.

Four pizzas are **65% of all units ever sold**. Herb Paneer Delight alone is
**25% of units and 30% of item revenue**. Nine items have never sold once.

### Two kinds of offer — label which one you are running

They look identical in the table and must be reviewed by opposite rules.

| | **Revival offer** | **Acquisition offer** |
|---|---|---|
| Goes on | a genuinely dead item | a proven best seller |
| Purpose | wake up a dish nobody orders | pull a Zomato customer to direct |
| Working if | it starts selling | direct orders rise; app orders fall |
| At review | **stop it once it sells** | **keep it while it converts** |

An acquisition offer is not a gift **as long as the local price still earns more
than the app does.** Check it every time:

```
Local  ₹149 × 95%    = ₹141.6   ← keep this larger
Zomato ₹229 × 60.1%  = ₹137.6
```

Herb Paneer Delight at ₹149 is an **acquisition** offer. It was originally
picked as a revival offer on website data, which was wrong — the reasoning was
corrected on 25 Aug, the offer was not.

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

⚠️ **Judge each item against its own history, not against the others.** The rule
above assumes a top-of-list item got there *because of* the discount. Herb Paneer
Delight has topped every month since March, offer or no offer — it will top this
query too, and deleting it would remove the offer that is doing the most work.

Ask of each item: **did this sell before the offer?**

- **No** → the revival worked. Stop the offer.
- **Yes, it was already number one** → acquisition offer. Keep it, and check
  instead that direct orders rose while app orders fell.

Also check **prep time** at this review. Orders over 25 minutes rate **2.17★**
against **4.16★** under. A successful offer pushes volume onto the busiest hours,
and Herb Paneer is the dish most often present in slow orders. If the rating is
sliding, the offer is working too well for the kitchen — that is a sequencing
problem, not a pricing one.

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
