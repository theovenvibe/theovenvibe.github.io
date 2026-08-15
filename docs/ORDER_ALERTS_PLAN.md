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
is that a **reserved** topic can be set to *"everyone can publish, only I
can read"* — so the public page can post to it with **no token at all**.

Every alternative fails on that one point:

| Option | Why not |
|---|---|
| Telegram bot | Bot token would ship in page source; anyone could spam or hijack |
| Discord webhook | Same exposure; weak mobile alerting |
| WhatsApp Business API | Needs a paid provider and a server |
| Pushover | Works, but paid per platform |

Full owner-facing setup lives in `skills/setup-order-alerts.md`.

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
4. **`skills/setup-order-alerts.md`** — the owner's step-by-step: account,
   reserved topic with write-only access, subscribing four devices, making
   Android/iOS actually ring, pasting the topic into the config, verifying
   live, and turning it back off.

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
- **The topic name is public.** Safe only while the topic is reserved with
  read restricted to the owner. If it is ever spammed, reserve a new random
  name and change one line of config.

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
- [ ] Owner completes ntfy setup and supplies the topic name
- [ ] Topic pasted into `site.config.json`
- [ ] `skills/qa-check.md` green on the branch
- [ ] Merge `--no-ff` into `develop`; build the merged state
- [ ] Release PR `develop` → `main` — **opened by the agent, merged by the
      owner** (standing instruction, PROGRESS.md 2026-08-14)
- [ ] Owner end-to-end test on the live page per skill §6
