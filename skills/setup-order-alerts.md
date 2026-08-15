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
| **ntfy.sh** | **Chosen.** Free, open source, apps for Android/iOS/web, and it accepts a plain POST with no token — the only option that works from public client-side code. |
| Telegram bot | Rejected. The bot token would ship in the page source, and anyone reading it could spam or hijack the chat. |
| Discord webhook | Rejected. Same exposure, and mobile alerts are easy to miss. |
| WhatsApp Business API | Rejected. Needs a paid provider and a server. |
| Pushover | Works, but costs per platform. ntfy does the same job free. |
| Cloudflare Worker in front of ntfy | Considered, rejected for now. It would hide the topic name behind a server-side secret, but it puts a second service between the customer and the kitchen that can fail silently. Revisit only if the topic is actually abused. |

## The one security fact you must understand

ntfy's **reserved topics with access control are a paid feature.** On the
free tier there is no access control at all: *anyone who knows the topic
name can both read it and post to it*, and the name is visible in the
page source of `/price-calculator/`.

That is acceptable here for exactly one reason: **the alert body contains
no customer PII.** It is the quote — items, prices, delivery slab, the
pre-order slot. No name, no phone number, no address. The worst a snooper
learns is how many pizzas were quoted today.

Two rules follow, and they are binding:

1. **The topic name is the password.** It must stay long and random. Never
   change it to something readable like `ovenvibe-orders`.
2. **Never add customer PII to the alert.** If the calculator ever starts
   collecting a name, phone or address, it must not go into the ntfy body —
   the alert would become a public leak the same day.

The realistic risk is not privacy, it is **spam**: a bored person who finds
the name could ring four phones at 3am. The fix takes one minute — see
"If the topic gets spammed" at the bottom.

## 1. Install the app — no account needed (owner, ~5 minutes)

Free ntfy topics are open, which means there is **nothing to sign up for**.
Skip any "Sign up" prompt.

**Each of the three phones:**
1. Install **ntfy** (Play Store / App Store).
2. Open it, tap **+** (Subscribe to topic).
3. Type the topic name exactly as it appears in `site.config.json` →
   `notifications.ntfy_topic`. Leave the server as the default `ntfy.sh`.
4. Subscribe. That is the whole setup for that phone.

**The laptop:**
1. Open `https://ntfy.sh/app` in the browser.
2. Click **Subscribe to topic**, enter the same name, subscribe.
3. Allow browser notifications when prompted, and keep the tab pinned.

Copy the topic name from the config rather than typing it from memory — it
is deliberately random, and a typo means a device that silently never
alerts.

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

## 5. The topic in the repo (already set — this section is for changing it)

`site.config.json` (repo root) already carries a random topic:
```json
"notifications": {
  "ntfy_topic": "ovenvibe-myt6ecdgbgyll6ot2978iw"
}
```
Nothing needs to be pasted for the initial setup — subscribe the devices to
that exact name and you are done. This section is the flow for **changing**
it later (rotation, or turning alerts off with `""`).

Generate a replacement name that is actually random, never one you invent
by hand:
```bash
python3 -c "
import secrets, string
a = string.ascii_lowercase + string.digits
print('ovenvibe-' + ''.join(secrets.choice(a) for _ in range(22)))
"
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

Nothing arrives? Check, in this order: the topic each device subscribed to
matches `site.config.json` **character for character** (a typo in a random
string is the most likely fault and it fails silently); the change actually
deployed (`gh run list --branch main --limit 1`); notifications are allowed
for the ntfy app / browser tab at the OS level.

You can also test without touching the site at all — this posts straight to
the topic and every subscribed device should sound:
```bash
curl -H "Title: Test alert" -H "Priority: urgent" \
  -d "If you can read this, the topic is wired up." \
  https://ntfy.sh/ovenvibe-myt6ecdgbgyll6ot2978iw
```
If that rings but a real order does not, the fault is in the site or the
deploy, not in ntfy.

## The two kinds of alert

| Sound | Title | What happened |
|---|---|---|
| **Urgent** (the loud one) | `New order Rs 549 (delivery)` | Someone tapped **Send order on WhatsApp** or **Copy quote** on `/checkout/` or `/price-calculator/`. The body is the whole basket — every item, quantity, extra, and the full price breakdown. |
| **High** (quieter) | `Heads up - Zomato` / `Heads up - Swiggy` | Someone left the website by tapping a Zomato or Swiggy link. An order may appear on that tablet shortly. |

They are deliberately different priorities. A customer messaging you directly
needs you now; a maybe-order on a partner app is worth a glance, not an alarm.

The partner alert covers **every** Zomato/Swiggy link on the site — the home
page buttons, the footer, `/sundargarh/` — because it matches on where a link
points, not on a label someone has to remember to add.

**What the alert never contains:** the customer's name, phone number or
address. `/checkout/` collects a name and mobile, and they go into the WhatsApp
message only. The topic is world-readable, so publishing them there would be a
public leak. If you ever add a field to the order form, keep it out of the
alert.

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

## If the topic gets spammed

Junk alerts at 3am mean someone found the name in the page source. This is
the expected failure mode of a free topic, and it is a five-minute fix:

1. Generate a new random name (the `python3` snippet in §5).
2. Put it in `site.config.json`, build, commit, merge, deploy per §5.
3. On all four devices: unsubscribe the old topic, subscribe the new one.

The old topic keeps receiving the spam, but nothing is listening to it any
more. Nothing else in the setup changes. If this ever happens repeatedly,
that is the trigger to revisit the Cloudflare Worker option in the table at
the top of this file — not before.

## Turning alerts back off

Set `ntfy_topic` back to `""`, rebuild, commit. No request is made at all —
the fetch is skipped entirely when the topic is empty (verified against the
built output, not assumed), so the page behaves exactly as it did before
this feature existed.

## Limits

The free ntfy.sh tier allows roughly 250 messages a day — far above this
kitchen's order volume. Access control and topic reservation are **paid**
features and are not used here; see "The one security fact" above. Only the price
calculator sends alerts; the WhatsApp buttons in the nav, the floating
button and the other pages do not, because those are conversations, not
orders. Wiring those in later means calling the same `notifyKitchen()` from
`src/pages/price-calculator.astro` from a shared script.
