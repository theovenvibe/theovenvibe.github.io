# AGENTS.md — The Oven Vibe (theovenvibe.github.io)

Cold-start primer for ANY agent or model working in this repo — including
small local LLMs. Read this fully before changing anything.
(Phase 1 skeleton; finalized in Phase 5. Requirements: PRD.md. State: PROGRESS.md.)

## What this is

Digital menu + lead-gen site for The Oven Vibe, a cloud kitchen in
Sundargarh, Odisha. Leads = phone calls and WhatsApp orders. No backend,
no payments. Astro (v7+) static site on GitHub Pages.

## Golden rules

1. **`menu.json` IS the menu.** Prices, names, descriptions, availability —
   all edits happen there. Never rename its fields (they mirror Zomato).
2. **`site.config.json` IS the business.** Delivery charges, hours, phone,
   rating, announcement banner. Pages never hard-code these values.
3. **`main` is FROZEN during the v2 rebuild** — live v1 site. All work goes
   feature branch → develop (skills/release-manager.md).
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

## Repo map

```
menu.json               ← THE menu (items, combos, add-ons)
site.config.json        ← business settings (delivery, hours, phone, rating)
src/schemas/            ← Zod schemas guarding both JSON files
src/lib/data.ts         ← the ONLY place JSON is loaded; helpers (isVeg, imageFor,
                          displayName/displayMeta/displayDescription = render-time
                          cleaning of menu.json copy — menu.json stays untouched)
src/lib/seo.ts          ← ALL structured data + shared SEO facts (Restaurant,
                          Menu from menu.json, FAQ, BlogPosting, Breadcrumb);
                          off-site links (Zomato/Swiggy/Maps/GBP) live in LINKS
src/components/Seo.astro← canonical + OG + Twitter + the JSON-LD @graph
src/pages/              ← routes: index, menu, contact, faq, sundargarh, blog/, 404
src/layouts/Layout.astro← base shell; takes title/description/ogTitle/ogType/
                          image/jsonLd props and renders <Seo> — a new page gets
                          full SEO markup for free, so use these props
docs/SEO_PLAYBOOK.md    ← what the site does vs. what the OWNER must do (GBP,
                          reviews, citations, Search Console) — read before
                          answering any "why is there no traffic" question
src/styles/global.css   ← Tailwind entry; design tokens land here in Phase 2
public/static/images/   ← food photos, AVIF+WebP, filename = image_code
public/*.html           ← v1 URL stubs (meta-refresh redirects) — do not delete
.github/workflows/deploy.yml← build every branch; deploy ONLY from main
skills/                 ← step-by-step task guides (start with the one you need)
PRD.md / PROGRESS.md    ← requirements / current state — read at session start
```

## Common tasks → skills

| Task | Skill file |
|---|---|
| Change a price / name / description | skills/update-price.md, skills/update-description.md |
| Add / remove / hide a menu item | skills/add-menu-item.md, skills/remove-or-disable-item.md |
| Change a photo | skills/update-item-photo.md |
| Delivery charges / hours / phone / rating | skills/update-delivery-charges.md, skills/update-hours-or-contact.md, skills/update-rating.md |
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
  **Phase 4 must create the blog posts at exactly these slugs.**
- Image URLs stay `/static/images/...` (on disk: `public/static/images/...`).
- Canonical origin lives in ONE place: `SITE_URL` in astro.config.mjs.
- Astro 7 notes: `src/fetch.ts` is a reserved filename (never create it);
  markdown uses Astro's new default processor — if blog posts need
  remark/rehype plugins, install `@astrojs/markdown-remark` explicitly.
