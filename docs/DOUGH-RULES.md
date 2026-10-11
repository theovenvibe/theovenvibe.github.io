# Dough rules — the arithmetic, the bugs, and how not to repeat them

Owner decisions, 25 Aug 2026; delivery-minimum logic retired 28 Sept 2026.
The current limits are enforced in code and covered by `npm run test:dough`.

## The rules

| # | Rule | Where |
|---|---|---|
| 1 | **Earn 5% on eligible prepared items**, offer items included. | backend captured catalogue policy + `admin.ts` |
| 2 | **Dough cannot be spent on items running an offer.** | `dough.ts` `spendableBase()` |
| 3 | **Mixed basket splits** — Dough applies only to the full-price part. | same |
| 4 | **Packaged drinks are excluded from spending AND earning; prepared shakes remain eligible.** | trusted published/captured `dough_excluded`; known packaged-code fallback |
| 5 | **Never two offers on one item.** | schema: `product_code` is the PK |

**Why rule 1 survives rule 2.** ₹3,335 of Dough has been credited and ₹183 ever
spent — a 5.5% redemption rate — so a ₹6 promise costs about 33 paise in
practice, and it is the only mechanism that brings a customer back. Blocking the
*spend* is worth ₹13–20 an order, every order. Blocking the *earn* saves almost
nothing and removes the reason to return. Prices still assume 100% redemption,
so the margin holds even if that rate climbs.

## The arithmetic

Two limits, tightest wins:

```
cap    = floor(spendable × 10%)
usable = max(0, min(balance, cap))
```

`spendable` is full-price food only; offer items and drinks are excluded.
There is no distance-based or late-night minimum to preserve after Dough is
applied. On a ₹99 eligible basket with a ₹50 balance, ₹9 may be used.

---

## Bugs found, and the root cause of each

### A · Dough stacked on top of an offer

**Symptom.** An item already discounted took a second discount, and a ₹20 drink
with ~₹1 of margin took one it cannot carry.

**Cause.** `spendCap()` was passed `order.food_total` — the entire basket. The
Worker had no way to tell an offer line from a full-price one, because nothing
ever asked.

**Fix.** `spendableBase()` excludes live offer items and drinks; the cap is taken
on that.

**Root cause.** The rule *"Dough vs discounts — one at a time, never both"* was
written in `DOUGH_AND_REFERRALS.md` as an intention and never implemented at item
level. **A rule in a doc with no code and no test is not a rule.** It sat unenforced
until the first offer went live and would have leaked from that day.

### B · Historical: the retired minimum blocked Dough

**Symptom.** ₹586 order, ₹7 balance, told to add more. Reported by the owner
within an hour of deploy.

**Cause.** Fixing bug A, both limits were switched to `spendable`. The cap should
use it; **headroom must not.** ₹169 of spendable was compared against the ₹299
pickup minimum, giving zero headroom on an order nearly twice that minimum.

**Former fix.** Headroom was computed against `foodTotal`. The minimum and
headroom logic were removed in the 2026-09-28 delivery update.

**Root cause.** One variable named `foodTotal` was silently redefined to mean
something narrower. Every reader downstream kept the old meaning in their head.
**When a value's meaning changes, its name must change too** — the two totals are
now `spendable` and `foodTotal` and can no longer be confused.

### C · Test offers invisible to the site

**Symptom.** An offer inserted by hand never appeared in `/availability`.

**Cause.** Written with SQLite's `datetime('now')` → `2026-08-25 01:49:20`
(space). The code compares against `new Date().toISOString()` →
`2026-08-25T01:49:20Z` (`T`). String comparison: `' '` (0x20) sorts before `'T'`
(0x54), so `ends_at > now` was always false.

**Fix.** Offer rows are written in ISO-8601 with the `T` separator, always.

**Root cause.** Two timestamp formats in one column, compared as strings. **Any
hand-written row must use exactly the format the application writes.** If you are
inserting by hand, generate the timestamp the same way the code does.

### D · A silenced failure sent me chasing a phantom

**Symptom.** A verification order returned ₹0. Two rounds were spent suspecting
the new code. The code was correct both times.

**Cause.** The `INSERT` seeding the test balance was run with output redirected to
`/dev/null`. It failed. The customer had no Dough, so ₹0 was the right answer to
the wrong question.

**Root cause.** **Never silence the output of a write you are about to depend on.**
A green-looking test on data that was never created proves nothing.

### E · The price calculator hid every offer

**Symptom.** The calculator quoted ₹189 for a pizza selling at ₹139, on the day
five offers went live. Checkout was correct.

**Cause.** The page fetched `/availability` and used only `sold_out`. The
`offers` field was in the same response, unread.

**Fix.** Offers applied the same way checkout does, strike-through included.

**Root cause.** I verified the path I had built and never asked **"what else on
this site shows a price?"** A fix is not finished until every surface that
displays the same fact has been checked.

### F · Nothing that touches the Worker can be tested on localhost

Not a bug, a trap that cost time twice. The Worker's CORS allows only the
production origin, so on `localhost` the `/availability` fetch fails **silently** —
offers simply never load and the page looks like it is ignoring them.

To test a built page against the real Worker, serve it *at* the production
origin with a Playwright route intercept. `marketing/zomato-scraper/calc4.mjs`
is a working example.

---

## Guardrails now in place

- `npm run test:dough` checks nonnegative integer results, balance and 10%
  caps, low-value baskets, and parity with the Worker spend cap.
- A cross-check that the number checkout shows is always one the Worker will
  honour — bug B was exactly that disagreement.
- The customer-facing sentence lives in **one** exported constant,
  `DOUGH_OFFER_RULE`, used by checkout, the Dough page, the FAQ and the price
  calculator. Four copies would be four chances to drift.

## Before changing any of this

1. `npm run test:dough` must pass.
2. `npm run build` must pass.
3. The 10% cap uses only eligible full-price food.
