# TODO

Things we have decided to do but have not done. One line per item, with enough
context that picking it up months later does not need this conversation.

`PROGRESS.md` is the record of what happened. This file is the queue of what is
next. When an item ships, delete it here and write it up there.

---

## Owner actions (nobody else can do these)

- [ ] **Subscribe the other two phones and the laptop to order alerts.** One
      phone is done and rings. Topic and steps: `skills/setup-order-alerts.md`.
- [ ] **Set the ntfy alert to a ringtone, not a notification sound**, and turn on
      *Insistent* so it keeps ringing until dismissed — Zomato-style. Skill §4.
- [ ] **Switch Settings → Pages → Source to "GitHub Actions"** to stop the
      phantom Jekyll failure on every `main` push. Do NOT add a `.nojekyll` file
      — AGENTS.md explains why that failure is protective.
- [ ] **Google Business Profile**: verify the claim, match the street address to
      `site.config.json` word-for-word, hours 11:30 AM–11:30 PM, add UPI /
      delivery / takeaway service options. Highest-value traffic lever we have.
- [ ] **Google Search Console**: add the property, submit `sitemap-index.xml`,
      request a re-crawl of `/`.
- [ ] **Measure the scooter's real mileage**, full tank to full tank. At ~10 km/l
      a 2–4 km delivery earns ₹5–7; at a normal 40–50 it earns ₹71–73. That one
      number decides whether the delivery pricing is right.

## Next up

- [ ] **Customer push notifications — now a project of its own.**
      Specced 2026-08-15 in **`../the-oven-vibe-backend`**
      (github.com/theovenvibe/the-oven-vibe-backend, private). Read its
      `PRD.md`; `docs/ECOSYSTEM.md` there explains how all four repos fit
      together.
      - **Blocked on an owner task:** `skills/setup-cloudflare.md` in that repo
        — account, D1 database, VAPID keys, Worker secrets. Nothing can start
        until those five values exist.
      - **Phase 0 touches THIS repo:** `/checkout/` will POST each order to the
        Worker, and `src/lib/notify.ts` will post to the Worker's `/alert`
        instead of ntfy directly, so `notifications.ntfy_topic` leaves
        `site.config.json` and becomes a Worker secret. That is what stops
        customer phone numbers being published to a world-readable topic.
      - Everything runs on free tiers. ₹0 is a hard requirement.

## Known gaps, deliberately left

- [ ] **Order alerts fire from `/price-calculator/`, `/checkout/`, and any
      Zomato/Swiggy link.** Still silent: the floating WhatsApp button, the
      WhatsApp links in the blog posts and on `/contact/`, Instagram, and people
      messaging the saved number directly. Owner chose this scope on 2026-08-15
      to keep false alarms down. **Review after a week of real use:** if real
      orders keep arriving with no alert before them, wire the remaining
      WhatsApp links using `publishNtfy()` from `lib/notify.ts`.
- [ ] **Direct orders are still not logged anywhere the dashboard can read.**
      The ntfy alert is the first thing that even sees a direct order, but free
      ntfy expires messages after about 12 hours, so it is not a log. This blind
      spot has now bent three separate analyses (MEMORY.md, "Data blind spot").
- [ ] **`unit_cost` is unfilled in `menu.json`**, so the dashboard's menu matrix
      shows price where it should show margin.
- [ ] **One line per distinct item in the basket.** Two of the same pizza where
      only one wants extra cheese is expressed by the extra's quantity ("Extra
      Cheese x1" under "Pizza x2"), not by two separate lines. Fine for a
      kitchen reading a WhatsApp message; revisit only if it actually confuses
      an order.

## Carried over, still not done

- [ ] Fold `docs/SEO_PLAYBOOK.md` Part B into a short owner-facing checklist.
- [ ] Move the Zomato / Swiggy / Maps URLs out of `src/lib/seo.ts` `LINKS` and
      into `site.config.json` — they are business values, and golden rule #2
      says those live in the config.
- [ ] Under review, not yet added to the menu: Small Fries ₹59 (attach driver),
      Midnight Pizza Box ₹249 locally, Cheese Pizza + Fries combo ₹279, a ₹299
      premium pizza as the top rung.
