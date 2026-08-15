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

- [ ] **Customer push notifications — the Zomato-style thing.** We want to send
      customers notifications for order updates, offers, new items, and the odd
      joke. **Not started — to be designed together first.**
      - What we now have that makes it possible: `/checkout/` collects a name and
        a mobile number, plus an explicit, unticked opt-in ("Send me offers and
        new items on WhatsApp"). That consent is recorded in the order message.
      - The hard parts to work through before writing any code: those details
        currently live only in the WhatsApp message the customer sends, so there
        is **no list anywhere** — building one means somewhere to store it.
        Sending marketing on WhatsApp needs the WhatsApp Business API and
        template approval; SMS needs a DLT-registered sender in India. Both cost
        money, unlike everything else on this site. A web push notification is
        free but only reaches people who allowed notifications in a browser,
        which is a much smaller audience than people who have ordered.
      - Also unresolved: who is a "customer" for this, how someone unsubscribes,
        and where the list lives so it is not a spreadsheet on one phone.
      - **Do not build this without agreeing the approach first** — owner's
        explicit instruction, 2026-08-15.

## Bugs

- [ ] **Clicking the greyed-out "Send order on WhatsApp" does not scroll to the
      invalid field.** Reported by the owner 2026-08-15, reproduced with an
      8-digit mobile number: the error message appears correctly under the
      field, but tapping the disabled button does not bring that field into
      view or focus it. Expected: scroll to the FIRST invalid field, show its
      error, put the cursor in it.
      - The code that should do this is `validateDetails()` in
        `src/pages/checkout.astro` — it calls `scrollIntoView` then focuses on a
        deferred turn — and it is reached from the `aria-disabled` branch of the
        send-link click handler in `src/lib/order-form.ts`.
      - **Prime suspect:** the click may never reach the link at all. Playwright
        reported `<div class="calc-actions"> intercepts pointer events` on that
        button during testing, which was written off as a scroll-animation
        artifact. The owner's report is the same symptom from a real browser, so
        that interception is worth re-testing properly with
        `document.elementFromPoint` over the button's centre while the page is
        at rest. If the wrapper really is swallowing the tap, the validation is
        fine and the fix belongs in the CSS.
      - Not urgent: the order is still correctly blocked, the error message is
        visible under the field, and the field turns red. This is a "help the
        customer find it faster" fix, not a correctness one.

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
