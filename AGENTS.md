# AGENTS.md — The Oven Vibe (theovenvibe.github.io)

Cold-start primer for ANY agent or model working in this repo — including
small local LLMs. Read this fully before changing anything.
(Finalized Phase 5, PRD §10. Requirements: PRD.md. State: PROGRESS.md.)

**If you are a small/local model (e.g. qwen-coder 3B/4B):** do not try to
plan a task from scratch. Start every task by opening the matching
`skills/*.md` file — each one is a complete, self-contained recipe with
exact paths, a before/after example, and a verify step. This file tells
you WHICH skill file to open; the skill file tells you exactly what to
do.

## What this is

Digital menu + lead-gen site for The Oven Vibe, a 100% pure vegetarian
cloud kitchen in Sundargarh, Odisha. Leads = phone calls and WhatsApp
orders. No backend, no payments. Astro (v7+) static site on GitHub Pages.

## Golden rules

1. **`menu.json` IS the menu.** Prices, names, descriptions, availability —
   all edits happen there. Never rename its fields (they mirror Zomato).
2. **`site.config.json` IS the business.** Delivery charges, hours, phone,
   rating, announcement banner, Umami analytics ID. Pages never hard-code
   these values.
3. **`main` is FROZEN during the v2 rebuild** — live v1 site. All work goes
   feature branch → develop (skills/release-manager.md). Post-launch this
   unfreezes to a normal flow — see skills/release-manager.md §8.
4. **Verify before commit:** `npm run build` (= `astro check && astro build`).
   A Zod error tells you the exact file + field to fix. Never bypass it.
5. **Never invent ratings/reviews.** rating values in site.config.json must
   match Google Business Profile exactly (PRD §3). Nothing else may ever appear
   in structured data — v1 shipped a fabricated 4.9/120 and fake reviews; that
   never comes back.
6. **The kitchen is 100% PURE VEG** (PRD §3). No copy, meta, schema or blog post
   may imply otherwise, recommend non-veg items, or say "veg and non-veg".
7. **No emoji in rendered UI.** Owner decision 2026-07-30. The WhatsApp SVG icon
   and the CSS-drawn `.veg-badge` are the only marks. menu.json keeps its emoji
   (Zomato mirror) — they are stripped at render time by src/lib/data.ts.
8. **Facts come from the config, never from prose.** Hours, delivery slabs,
   phone, address, price range: `site.config.json` / `menu.json`. v1 stated three
   different opening times on three pages; do not reintroduce that.
9. Node ≥ 22.12 required. Astro version is v7+ — training data lags; check
   live docs (docs.astro.build) for config/API questions, not memory.
10. **Analytics is opt-in and silent by default.** `site.config.json` →
    `analytics.umami_website_id` empty = no tracking script is emitted at
    all (verified byte-for-byte in Phase 5). Never add a tracking script
    anywhere else in the codebase — Umami Cloud is the only analytics
    (PRD §5); v1's GTM/gtag/Yandex Metrika are dropped for good.
11. **Order alerts are opt-in the same way, and the topic name IS the
    password.** `site.config.json` → `notifications.ntfy_topic` empty = the
    price calculator makes no request at all. When set, it publishes the
    quote to `https://ntfy.sh/<topic>` so the kitchen's phones ring
    (skills/setup-order-alerts.md). Free ntfy.sh has **no** access control —
    reservations are a paid tier — so the topic must stay long and random,
    and it is only safe to send there because the quote carries no customer
    name, phone or address. **Never** put an API key, bot token or webhook
    secret in client-side code to add another alert channel, and never send
    customer PII to the topic; the whole site is public source.

12. **The order form is implemented once.** `/price-calculator/` and
    `/checkout/` share `src/lib/order-form.ts` +
    `components/OrderOptions.astro` + `components/OrderQuote.astro`; a page
    supplies only its basket (`BasketRow[]`). Never copy that behaviour into a
    third page, and never restyle it from a page's scoped `<style>` — its CSS
    is global in `styles/order-form.css` / `styles/cart.css` because scoped
    rules do not reach into a child component. See docs/CART_AND_CHECKOUT.md.
13. **Know what the ntfy alert publishes.** The cart stores quantities against
    catalogue ids only — no names, no prices. `/checkout/` collects a name and
    mobile, and by owner decision (2026-08-15) those go into the alert as well
    as the WhatsApp message, via `alertIncludesCustomer` in `order-form.ts`.
    That flag defaults to **off** and only `/checkout/` opts in — keep it that
    way. The topic has no access control (rule 11), so treat everything sent
    there as public; if that exposure ever needs closing, put a Cloudflare
    Worker in front of ntfy rather than weakening the order form. Never add an
    API key or webhook secret to client code.
14. **Order sending is gated twice.** `canSend` greys the buttons out;
    `beforeSend` re-validates at the moment of sending and refuses regardless
    of how the button looked. Never replace the pair with just one — a disabled
    button is presentation, not a guarantee. See docs/CART_AND_CHECKOUT.md.

## Repo map

```
menu.json                ← THE menu (items, combos, add-ons) — Zomato mirror
site.config.json         ← business settings (delivery, hours, phone, rating,
                           announcement banner, analytics.umami_website_id,
                           notifications.ntfy_topic)
src/schemas/             ← Zod schemas guarding both JSON files
src/lib/data.ts          ← the ONLY place JSON is loaded; helpers (isVeg, imageFor,
                           displayName/displayMeta/displayDescription = render-time
                           cleaning of menu.json copy — menu.json stays untouched)
src/lib/seo.ts           ← ALL structured data + shared SEO facts (Restaurant,
                           Menu from menu.json, FAQ, BlogPosting, Breadcrumb);
                           off-site links (Zomato/Swiggy/Maps/GBP) live in LINKS
src/components/Seo.astro ← canonical + OG + Twitter + the JSON-LD @graph
src/components/          ← Nav, Footer, WhatsAppFab, MenuCard, MenuAccordions,
                           AddonsAccordion, BlogPostLayout (shared blog wrapper)
src/pages/               ← routes: index, menu, contact, faq, sundargarh, blog/, 404
src/pages/blog/*.astro   ← each blog post is its OWN .astro file using
                           BlogPostLayout — NOT a markdown content collection.
                           New post → skills/add-blog-post.md (template inline).
src/layouts/Layout.astro ← base shell; takes title/description/ogTitle/ogType/
                           image/jsonLd props (+ emits the Umami script tag when
                           analytics.umami_website_id is non-empty) and renders
                           <Seo> — a new page gets full SEO markup for free
src/styles/global.css    ← the design system (ported verbatim from v1's style.css)
src/styles/polish.css    ← Phase 3.5 additive motion/hover layer (owner-approved)
public/scripts/site.js   ← shared interactions (scroll-reveal, mobile menu,
                           accordions, + Phase 5 Umami call_click/wa_click events)
public/static/images/    ← food photos, AVIF+WebP, filename = the item's code
public/static/images/og/ ← 1200×630 JPEG share images (hero + each blog post) —
                           regenerated by hand when the source photo changes,
                           see skills/update-item-photo.md §6
public/*.html            ← v1 URL stubs (meta-refresh redirects) — do not delete
.github/workflows/deploy.yml ← build every branch; deploy ONLY from main
                           (renamed from ci.yml in Phase 5 — owner requirement)
skills/                  ← step-by-step task guides — open the matching one first
docs/SEO_PLAYBOOK.md     ← what the site does vs. what the OWNER must do (GBP,
                           reviews, citations, Search Console) — read before
                           answering any "why is there no traffic" question
docs/archive/            ← superseded design research (RESEARCH.md, DESIGN.md) —
                           kept for the photo-audit/pattern facts, not current design
.claude/skills/          ← Claude-side design skills (frontend-design, theme-factory,
                           ui-ux-pro-max, webapp-testing) — kept for future design work
PRD.md / PROGRESS.md     ← requirements / current state — read at session start
```

## Common tasks → skills

| Task | Skill file |
|---|---|
| Change a price | skills/update-price.md |
| Change a name / description | skills/update-description.md |
| Hide, disable, or bring back an item | skills/remove-or-disable-item.md |
| Add a brand-new menu item | skills/add-menu-item.md |
| Add/edit a combo | skills/update-combo.md |
| Change a photo (item, combo, add-on, blog) | skills/update-item-photo.md |
| Delivery charges / free-delivery threshold | skills/update-delivery-charges.md |
| Hours / phone / WhatsApp / address / Instagram | skills/update-hours-or-contact.md |
| Update the star rating / review count | skills/update-rating.md |
| Add a new blog post | skills/add-blog-post.md |
| Turn on Umami analytics | skills/setup-analytics.md |
| Turn on order alerts (ntfy) so the kitchen hears an order | skills/setup-order-alerts.md |
| Change the cart, checkout, or the shared order form | docs/CART_AND_CHECKOUT.md |
| What we have decided to do but not done yet | TODO.md |
| Pre-merge QA (JSON-LD, emoji, honesty checks) | skills/qa-check.md |
| Check the site actually works (routes, phone flow) | skills/verify-site.md |
| How CI/deploy works, reading `gh run list` | skills/deploy-cicd.md |
| Branch, merge, release, rollback | skills/release-manager.md, skills/release-recovery.md |
| Build broken? | skills/troubleshoot-build.md |

## Fixed decisions (do not re-decide)

- Old v1 URLs map to these routes forever (stubs in public/):
  blog-cloud-kitchen-future→/blog/cloud-kitchen-future/ ·
  blog-veg-vs-non-veg→/blog/veg-vs-non-veg/ ·
  blog-pizza-under-300→/blog/pizza-under-300/ ·
  blog-affordable-pizza→/blog/affordable-pizza/ ·
  blog-late-night-food→/blog/late-night-food/ ·
  contact→/contact/ · faq→/faq/ · sundargarh-770001→/sundargarh/
- Image URLs stay `/static/images/...` (on disk: `public/static/images/...`).
- Canonical origin lives in ONE place: `SITE_URL` in astro.config.mjs.
- Astro 7 notes: `src/fetch.ts` is a reserved filename (never create it).
  Blog posts are individual `.astro` files (see `src/pages/blog/*.astro`
  and `skills/add-blog-post.md`) — this repo does NOT use an Astro
  content collection for the blog; don't add a `.md`/`.mdx` file expecting
  it to become a page on its own.
- The CI/deploy workflow file is `.github/workflows/deploy.yml` (renamed
  from `ci.yml` in Phase 5, owner requirement) — build runs on every
  branch, deploy is gated to `main` only.
- **NEVER add a root `.nojekyll` file.** While the repo's Pages setting is
  still "deploy from a branch" (owner account `theovenvibe` hasn't switched
  it to "GitHub Actions" yet), a harmless-looking failing "pages build and
  deployment / build (dynamic)" check runs on every main push. That Jekyll
  failure is PROTECTIVE — with `.nojekyll` it would SUCCEED and publish the
  raw Astro source over the live site. The correct fix is the owner
  flipping Settings → Pages → Source to "GitHub Actions"; ignore the red ✗
  until then.
