# Skill: setup-order-alerts

Make every phone and the laptop ring when a customer places an order from
`/price-calculator/`. This is the second task in `skills/` written for
**Milan (the owner)** rather than an editing agent — like
`skills/setup-analytics.md`, it starts with creating an account on a site
outside this repo, and ends with a one-line config paste any agent can do.

## Why this exists

The calculator hands the customer a quote and opens WhatsApp with it. That
part works. The failure is on the kitchen's side: nobody watches WhatsApp
continuously, so an order message can sit unread for an hour. A missed
order is worth more than every price rule in `src/lib/pricing.ts` combined.

## Why ntfy.sh and not a WhatsApp tool

The site is a static build on GitHub Pages — there is no server, so
whatever sends the alert has to run in the customer's browser, from code
anyone can read. That rules out anything needing a secret:

| Option | Verdict |
|---|---|
| **ntfy.sh** | **Chosen.** Free, open source, apps for Android/iOS/web. A reserved topic can be set "everyone can publish, only I can read", so the public page needs no token at all. |
| Telegram bot | Rejected. The bot token would ship in the page source, and anyone reading it could spam or hijack the chat. |
| Discord webhook | Rejected. Same exposure, and mobile alerts are easy to miss. |
| WhatsApp Business API | Rejected. Needs a paid provider and a server. |
| Pushover | Works, but costs per platform. ntfy does the same job free. |

## 1. Create the ntfy.sh account (owner, ~2 minutes)

1. Go to `https://ntfy.sh/`.
2. **Sign up** (top right) with an email and password.
3. Log in, then open your username menu (top right) → **Account**.

## 2. Reserve the topic — this is the security step (owner, ~2 minutes)

An unreserved ntfy topic is readable by anyone who knows its name, and the
name ships in the page source. Reserving it fixes that.

1. On the **Account** page, find **Reserved topics** → **Add**.
2. Topic name: `ovenvibe-orders-k9m4qz` (or any name you like — it must be
   letters, numbers, hyphens and underscores only, 64 characters max).
3. Access: **"Everyone can publish, only I can read"** (may be shown as
   *write-only*). Do **not** leave it public-read.
4. Save.

If you ever suspect the topic is being spammed, reserve a new one with a
different random name and repeat step 4 below — nothing else changes.

## 3. Subscribe every device (owner, ~5 minutes)

**Each of the three phones:**
1. Install **ntfy** (Play Store / App Store).
2. Open it → account settings → log in with the account from step 1
   (server `ntfy.sh`). Logging in is required, because only the account
   owner can read this topic.
3. Tap **+** → subscribe to the topic name from step 2.

**The laptop:**
1. Open `https://ntfy.sh/app`, log in, subscribe to the same topic.
2. Keep the tab pinned, and allow browser notifications when prompted.

## 4. Make the alert loud (owner, ~2 minutes per phone)

Alerts are published at **urgent** priority, which is what lets Android
treat them as an alarm rather than a quiet buzz.

- **Android:** ntfy app → the subscription → settings → allow max
  priority. Then Android **Settings → Apps → ntfy → Notifications**: set
  the *Max priority* channel to **Sound**, and turn on **Override Do Not
  Disturb**.
- **iOS:** ntfy app → subscription settings → enable notifications, then
  iOS **Settings → Notifications → ntfy** → **Time Sensitive** on so it
  breaks through Focus.
- **Laptop:** the browser tab plays a sound; keep the volume up.

## 5. Paste the topic into the repo (owner or an agent — normal config edit)

Open `site.config.json` (repo root), find:
```json
"notifications": {
  "ntfy_topic": ""
}
```
Paste the topic name between the quotes:
```json
"notifications": {
  "ntfy_topic": "ovenvibe-orders-k9m4qz"
}
```
Then the normal edit flow:
```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/enable-order-alerts origin/develop
# ... paste the topic as above ...
npm run build
git add site.config.json PROGRESS.md
git commit -m "feat(alerts): enable ntfy order alerts"
git push -u origin feature/enable-order-alerts
```
Expect `npm run build` to print `0 errors` and `Complete!`. The only thing
that can be wrong here is the topic's shape; the error will name it
(`site.config.json → notifications.ntfy_topic: ...`). Fix the paste and
re-run. Still stuck → `skills/troubleshoot-build.md`.

Then merge per `skills/release-manager.md` §5.

**From a phone (GitHub web editor):** same as any other `site.config.json`
edit — see `skills/update-hours-or-contact.md` §9 for the tap-by-tap flow.

## 6. Verify it's live (owner, after the change is merged and deployed)

1. Open the live `/price-calculator/` on a phone that is **not** one of the
   three subscribed to the topic (or use a private window).
2. Build any order and tap **Order on WhatsApp**.
3. All four devices should sound within a couple of seconds, with a title
   like `New order Rs 549 (delivery)` and the full quote as the body.
4. Tap **Copy quote** instead — that fires an alert too, worded
   `Copied the quote:`.

Nothing arrives? Check, in this order: the topic in `site.config.json`
matches the reserved topic exactly; the change actually deployed
(`gh run list --branch main --limit 1`); each device is logged into the
ntfy account (a device that is only *subscribed*, not logged in, cannot
read a write-only topic and will show nothing).

## What the alert means — read this once

The alert fires when the customer **opens WhatsApp or copies the quote**,
not when the message actually arrives. The customer can still change their
mind. So:

- Treat it as "someone is about to message us" — open WhatsApp and look.
- Expect some alerts with no message behind them. That is the deliberate
  trade: a false alarm costs a glance, a missed order costs the order.
- The alert body is a full record of the quote the customer was looking at,
  including the acknowledgement lines. It is the first thing this business
  has that logs a direct order at all (see MEMORY.md, "Data blind spot") —
  ntfy keeps messages for a limited window on the free tier, so it is a
  live alert, not an archive. Do not treat it as the order log.

## Turning alerts back off

Set `ntfy_topic` back to `""`, rebuild, commit. No request is made at all —
the fetch is skipped entirely when the topic is empty, so the page behaves
exactly as it did before this feature existed.

## Limits

The free ntfy.sh tier allows roughly 250 messages a day and a handful of
reserved topics — far above this kitchen's order volume. Only the price
calculator sends alerts; the WhatsApp buttons in the nav, the floating
button and the other pages do not, because those are conversations, not
orders. Wiring those in later means calling the same `notifyKitchen()` from
`src/pages/price-calculator.astro` from a shared script.
