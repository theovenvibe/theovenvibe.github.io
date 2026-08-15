# Order alerts — plan and status

Branch: `feature/ntfy-order-alerts` (cut from `origin/develop`, 2026-08-15)

## The problem

`/price-calculator/` builds a quote and opens WhatsApp with it. That half
works. The other half does not: nobody on the kitchen side watches WhatsApp
continuously, so an order message can sit unread. Orders are being missed.

The fix has to work with four devices (one laptop, three phones) and cost
nothing, and it has to work on a static GitHub Pages build — there is no
server, so the alert must be sent from the customer's browser by code that
anyone can read.

## The decision: ntfy.sh

Free, open source, apps on Android/iOS and a web app. The deciding property
is that it accepts a plain POST with **no token at all** — the only thing
that can work from public client-side code.

Every alternative fails on that one point:

| Option | Why not |
|---|---|
| Telegram bot | Bot token would ship in page source; anyone could spam or hijack |
| Discord webhook | Same exposure; weak mobile alerting |
| WhatsApp Business API | Needs a paid provider and a server |
| Pushover | Works, but paid per platform |

Full owner-facing setup lives in `skills/setup-order-alerts.md`.

## The correction that shaped the final design

The first version of this plan relied on an ntfy **reserved** topic set to
*"everyone can publish, only I can read"*. That turned out to be a **paid**
feature — ntfy's own docs say the free tier has no access control and that
*"your topic name functions as a password, so you are responsible for
choosing topic names that cannot be easily guessed."*

So on the free tier, anyone who reads the topic name out of the page source
can both read the topic and post to it. Two options remained:

1. **A long random topic name**, accepting that it is effectively public.
2. **A Cloudflare Worker** in front of ntfy, holding the real topic as a
   server-side secret. Free (100k requests/day), hides the topic from
   readers — but does not stop spam either, since the Worker URL is just as
   public, and it inserts a second service that can fail silently between
   the customer and the kitchen.

**Chosen: option 1**, with the topic generated from `secrets` (22 random
characters, ~113 bits). The reasoning is that the exposure being bought back
by option 2 is worth very little: the alert body carries **no customer PII**
— items, prices, delivery slab, pre-order slot, and nothing else. A snooper
learns the day's order volume. Against that, an extra hop between a customer
placing an order and the kitchen hearing it is a real reliability cost, and
reliability is the entire point of this feature.

This makes two things binding, both recorded in AGENTS.md golden rule 11 and
MEMORY.md:

- The topic name stays **long and random** — never a readable word.
- **No customer name, phone or address may ever be added to the alert body.**
  If the calculator starts collecting those, the alert becomes a public leak
  the same day.

The realistic risk is spam, not privacy. Rotation is one line of config plus
re-subscribing four devices, and the Worker option gets revisited only if
spam actually happens.

## What was built

1. **`site.config.json` → `notifications.ntfy_topic`** — new config field,
   default `""`. Empty means the feature is completely off: no fetch is
   made, the page behaves exactly as before. Same off-by-default contract as
   `analytics.umami_website_id` (AGENTS.md golden rule 10).
2. **`src/schemas/site-config.ts`** — Zod validation on the topic name
   (empty, or 1–64 chars of letters/numbers/hyphens/underscores), with the
   error text naming the field, so a bad paste fails the build instead of
   silently disabling alerts.
3. **`src/pages/price-calculator.astro`** — `notifyKitchen()` posts the
   quote to `https://ntfy.sh/<topic>` at `Priority: urgent`, fired from both
   the **Order on WhatsApp** link and the **Copy quote** button.
   - `keepalive: true` — a normal fetch is cancelled when the tab hands off
     to WhatsApp; without this the alert is lost exactly when it matters.
   - `asciiHeader()` — ntfy sends headers as latin-1, so `₹` and the en-dash
     in slab labels would break the request. The title is ASCII (`Rs 549`);
     the body keeps full UTF-8.
   - A dedupe guard so a double-tap does not ring four devices twice.
   - `.catch(() => {})` — a dead alert must never block the customer from
     ordering.
4. **`skills/setup-order-alerts.md`** — the owner's step-by-step: subscribing
   four devices (no ntfy account is needed at all on a free topic), making
   Android/iOS actually ring, a `curl` test that isolates ntfy from the site,
   rotating the topic if it is spammed, and turning alerts back off.

## Known limits — stated, not hidden

- **It signals intent, not a sent message.** The alert fires on the click.
  A customer can still abandon. False alarms cost a glance; the alternative
  costs orders. The skill file says this in the owner's own words.
- **Not an order log.** Free-tier ntfy retains messages for a limited window.
  It answers the "nobody sees the order" problem, not the standing
  "direct orders are invisible to the dashboard" problem in MEMORY.md —
  though it is the first thing that captures a direct order at all.
- **Calculator only.** The nav/FAB WhatsApp buttons stay silent: those are
  conversations, not orders. Wiring them up later means lifting
  `notifyKitchen()` into a shared script.
- **The topic name is effectively public**, and free ntfy cannot restrict it.
  Acceptable only because the body carries no customer PII, and only while it
  stays long and random. Spam is the live risk; rotation is the fix.

## Status

- [x] Config field + Zod schema
- [x] Calculator wiring (`notifyKitchen`, both triggers)
- [x] `skills/setup-order-alerts.md`
- [x] `npm run build` green (0 errors, 0 warnings, `Complete!`)
- [x] `skills/qa-check.md` steps 1–5 green (13 JSON-LD blocks parse, 0 emoji,
      rating still 4.9/16, no non-veg hits, calculator page has title +
      description and no image missing alt)
- [x] Driven for real in a headless browser against the built `dist/` over
      HTTP, with the ntfy request intercepted rather than sent: a ₹516 basket
      published **one** alert on Copy, **none** on the second click (dedupe
      holds), and a second alert on the WhatsApp click. Title arrived as
      `New order Rs 516 (delivery)` — pure ASCII — with `Priority: urgent`
      and the full ₹-bearing quote intact in the UTF-8 body.
- [x] Off-by-default proven, not assumed: rebuilt with `ntfy_topic: ""` and
      re-ran the same script — **zero** requests on either click.
- [x] Random topic generated and set in `site.config.json` (nothing to
      reserve — free topics need no account)
- [ ] Owner subscribes the laptop + 3 phones and confirms the `curl` test rings
- [ ] Merge `--no-ff` into `develop`; build the merged state
- [ ] Release PR `develop` → `main` — **opened by the agent, merged by the
      owner** (standing instruction, PROGRESS.md 2026-08-14)
- [ ] Owner end-to-end test on the live page per skill §6
