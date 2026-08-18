# MEMORY.md

Durable notes for this repo. Read before touching `menu.json`.

## What this repo is

The public site for The Oven Vibe, served from `main` via GitHub Pages.
`menu.json` is the single source of the menu — `public/scripts/site.js` reads it.
Prices here are the **local menu prices**, not Zomato prices. Zomato runs its own
higher price list (roughly 1.5× on mains, at parity on sides as of Aug 2026).

## The site is an installed app, not just a website

People add it to their home screen, so **anything full-screen or bottom-anchored
must behave like an app component, not a CSS class**:

- A full-screen overlay takes a **history entry** while open, so the hardware
  back button closes it instead of leaving the page. The mobile menu did not,
  and back exited the whole app (fixed 2026-08-18).
- Anything anchored to the bottom needs a height cap and `overflow-y: auto`.
  Without it, content past the fold is unreachable and nobody can tell — the
  admin's sheet hid its own heading this way for a day.
- `overscroll-behavior: contain` on any scrollable overlay, or the page behind
  it scrolls too.

## Live data the site reads at runtime

The static build no longer decides everything. `GET /availability` on the Worker
returns, in one call: what is **sold out**, live **offer prices**, whether the
**kitchen is open**, and the **late-night block list**. `CartScript.astro` polls
it every 60s and on tab focus.

**All of it fails open.** No answer means everything is available, at its normal
price, with the kitchen open — the direction that never costs an order.

`site.config.json` still holds the build-time defaults, and the live list is an
overlay on top. That matters for the late-night rule: the config carries the
*category* rule, which catches a new pasta automatically, and the admin list
adds whatever has changed since the last deploy.

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

## Rain — the one charge that can appear after the quote

Four cases, and only one of them is a tick box:

- **Ordering now, delivery** — "It's raining right now (+₹29)" is tickable.
- **Pre-order** — nobody knows the weather yet, so the box is hidden and replaced
  by a plain line: if it rains when we ride out, ₹29 is added on delivery.
- **Paid online, outside the late-night window** — no rain charge. Asking someone
  who already paid on the QR for another ₹29 at the door is not worth the review
  it earns, and a confirmed prepaid order is worth more than the ₹29.
- **Late night** — prepaid **and** still rain-charged. Paying up front after
  closing is the condition of firing the oven at all, not a waiver. This is the
  one place where prepayment does *not* lock the price, and it is deliberate
  (owner's rule). The prepaid tick box is therefore hidden inside the window: it
  is not a choice there.

Pickup never carries rain: no ride, no charge.

The old ₹10 pre-order discount was removed — it paid people for saying "later"
with no commitment attached.

## Pre-ordering is a mode, not a guess

`preorder.min_hours_ahead` (3) is the kitchen's prep notice. With the toggle off,
the date and time are locked to now and follow the clock; with it on, the fields
open and the earliest slot is now + 3 hours. Anything chosen inside that window
is pulled forward, with a note saying why.

**Every rule is judged at the slot the customer picked, not the moment they are
typing.** A pre-order for 11:45pm gets late-night pricing, the limited menu and
the prepaid-plus-rain wording; one for 10pm stays standard. The slot leads the
message so the kitchen reads WHEN before it reads what.

## Two voices, and they must not be mixed

The same fact is written twice in `site.config.json`, because it has two readers:

- **Page notes** (`rain.later_note`, `rain.prepaid_note`, `late_night.advance_note`)
  — the website speaking **to** the customer. "Your price is locked", "when we
  ride out". Do not change these to first person.
- **`*_quote` variants** — the message the customer **sends to the kitchen** via
  clipboard or WhatsApp. Written in the customer's voice as an acknowledgement:
  "please send your QR so I can pay it", "I understand that… is added to my bill".
  This makes the message a record of what they agreed to, which is the point.

Every state has one: delivery paid/unpaid, late night, pickup, late-night pickup.
A message with no acknowledgement line is a bug — pickup had that gap once.

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

## Order alerts — why ntfy, and what the alert actually means

The calculator's WhatsApp hand-off was never the weak point; nobody watching
WhatsApp was. `notifications.ntfy_topic` in `site.config.json` turns on a
POST to `https://ntfy.sh/<topic>` at urgent priority when a customer opens
WhatsApp with the quote **or** copies it, so four devices sound at once.
Empty topic = no request is made at all. Setup: `skills/setup-order-alerts.md`.

- **Why ntfy and not Telegram/Discord:** this is a static public build, so the
  alert is sent by code anyone can read. ntfy needs no token to publish; a bot
  token or webhook URL in page source would be a giveaway. Never add an alert
  channel that needs a secret in client code.
- **The topic name is the only password, and that was a forced choice.** The
  first design used a *reserved* topic set to "everyone can publish, only I can
  read" — that turned out to be an ntfy **paid** feature. Free ntfy.sh has no
  access control at all, so anyone who reads the topic name out of the page
  source can both read and post to it. Two consequences that must survive any
  future edit: the topic stays **long and random** (never a guessable word like
  `ovenvibe-orders`), and **nothing carrying a customer's name, phone or
  address may ever be added to the alert body** — what makes the exposure
  acceptable is that the quote is only items, prices and a slot. Spam is the
  live risk, not privacy; the fix is rotating the name, one line of config.
- A Cloudflare Worker proxy holding the topic as a server-side secret was
  considered and rejected: it removes an exposure worth little (order volume)
  in exchange for a second service that can fail silently between the customer
  and the kitchen. Revisit only if the topic actually gets spammed.
- **The alert is order *intent*, not a sent message.** It fires on the click,
  and the customer can still walk away. Accepted deliberately: a false alarm
  costs a glance, a missed order costs the order.
- **It is not the order log.** Free-tier ntfy retains messages briefly. The
  "direct orders are invisible" blind spot below is still open — this is the
  first thing that even sees a direct order, not a fix for it.
- Two browser details that will look like bugs if forgotten: the fetch needs
  `keepalive: true` (the tab is handing off to WhatsApp and would otherwise
  cancel it), and ntfy headers are latin-1, so `₹` and the en-dash in slab
  labels must be stripped from the `Title` — body text stays UTF-8.

## The order form exists once, and that is load-bearing

`/price-calculator/` and `/checkout/` are the same form with different baskets.
The behaviour — slot handling, availability, the rain/prepaid interplay, the
quote wording, the WhatsApp hand-off, the ntfy alert — lives in
`src/lib/order-form.ts`; the markup in `components/OrderOptions.astro` and
`OrderQuote.astro`; the arithmetic, as always, in `src/lib/pricing.ts`. A page
supplies a `BasketRow[]` and nothing else.

**Do not copy that logic into a third page.** Ten releases went into getting
these rules right; two copies would drift, and the drift would be silent because
each page would still look correct on its own. Full design:
`docs/CART_AND_CHECKOUT.md`.

- Styles for it are in `styles/order-form.css` and `styles/cart.css`, **global,
  not scoped**. Astro scopes a component's styles to its own markup, so a rule
  written in the page silently stops applying the moment the element moves into
  a shared component. This bit once; it is why those files exist.
- The cart stores **quantities against catalogue ids only** — never names or
  prices. Prices come from the current build, so an overnight basket cannot
  quote a stale price and a delisted item drops out instead of being ordered.
- **Add-ons attach to a basket line**, with their own quantity, and nest under
  their dish in the message. A loose "Extra Cheese" next to two pizzas is not an
  order anyone can cook. One line per distinct item; "cheese on one of the two"
  is the extra's quantity.
- **Customer name and mobile go in the WhatsApp message AND, by owner decision
  (2026-08-15), in the ntfy alert** so the kitchen can call back from the
  notification. `order-form.ts` still builds the two texts separately and
  `alertIncludesCustomer` defaults to **off**; only `/checkout/` opts in. The
  cost is real and was accepted knowingly: a free ntfy topic has no access
  control, so every customer number is published to a channel strangers can
  subscribe to if they find the topic name in the page source. The fix, if it
  ever matters, is a Cloudflare Worker holding the topic as a server-side
  secret — not weakening the order form.
- **Sending is gated twice**: `canSend` greys the buttons out, `beforeSend`
  re-validates at the moment of sending. A disabled button is presentation, not
  a guarantee — keep both. The phone check rejects letters outright rather than
  stripping them, because stripping turns "aaaaaaaaaa" into "" and
  "9abc692261138" into something that looks valid.

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

## Verifying UI changes — two traps already hit

- **Never verify a DOM change by reading back the property you just set.** A
  probe that checked `element.hidden` passed while the element was still painted:
  `.calc-check` sets `display: flex`, which beats the user-agent stylesheet's
  `[hidden] { display: none }`. Read `getComputedStyle().display` and the layout
  height instead. The page now states `[hidden] { display: none !important }`.
- **Never grep a build for the type-check summary alone.** `- 0 errors` comes from
  `astro check` and prints happily above a failed `astro build`. Grep for
  `Complete!` and `ERROR`.
- To exercise time-dependent rules, fake the clock in the probe (override
  `window.Date` before the page's script runs) rather than waiting for a real
  hour, and drive the page from the built `dist/` over a local HTTP server —
  `file://` breaks the absolute asset paths and renders the page unstyled.

## Keep in sync

`menu.json` prices, the printed menu, the Zomato catalogue and
`../the-oven-vibe-dashboard/data/menu.csv` are four copies of the same facts.
Change one, change all four.

## The pickup discount is retired (2026-08-19)

₹30 off pickup over ₹299 — **commented out, not deleted**. Full reasoning and
the restore steps: `docs/PICKUP_DISCOUNT.md`.

The maths that killed it: on a 0–2 km delivery we collect ₹29 and burn ~₹11 of
petrol, so **delivering is ₹18 better for us than the same order collected**.
Below ₹499 the discount meant paying ₹30 for the privilege of losing ₹18. Only
above ₹499 — where delivery is already free — does a pickup save us anything,
and that is ₹11.

Stacked with Dough, a ₹299 pickup landed at 50% food cost, the thinnest thing on
the menu. Dough replaces it: 5% back is ₹15 on that order, costs nothing today,
and brings them back instead of just being cheaper once.

**Do not re-add it without redoing this arithmetic.** If it returns, ₹10 above
₹499 is the only band where the saving is real.
