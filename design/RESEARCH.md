# Phase 2a — Design Research & Inspiration Brief

**The Oven Vibe** · cloud kitchen, Sundargarh, Odisha · digital menu / lead-gen rebuild
Prepared: 2026-07-29 · For: Milan (owner reaction) · Feeds: Phase 2b (design system + mockups)

---

## 1. Photo audit (looked at 10 real catalogue photos + logo files)

Reviewed directly: hero `752649876` (Paneer Makhni Royale Pizza), `751393909` (Veg Fried Rice), `745802369` (Zesty Onion Feast Pizza), `751793935` (Creamy Alfredo Pasta), `752623129` (Tangy Green Chutney Sandwich), `759685338` (Motu Burger), `760595845` (Korean Spicy Maggi), `760607587` (Chilli Garlic Potato Pops), combos `752694444` and `745802348`.

| Trait | Observation |
|---|---|
| **Background** | Pure/near-pure black on every single shot, no exceptions. This is the single strongest unifying trait in the whole catalogue. |
| **Lighting** | Studio-lit, single key light from upper-left-ish, soft but directional — visible speckle/highlight on ceramic glaze (the ring-light dots on plates are a repeated "tell"). A few (burger, sandwich) go moodier/harder-shadowed than the flat-lit pizzas. Not perfectly consistent lighting rig across shoots, but close enough that grading can unify it. |
| **Angle/crop** | Mostly top-down or near-top-down (pizzas, fried rice, snacks); burger and sandwich are 3/4 hero shots. Framing is inconsistent — some subjects fill 80% of frame, others (sandwich, burger) float small and centered with a lot of dead black space. This is the biggest real weakness. |
| **Props** | Real, decent-quality ceramic/stoneware plates and boat-dishes, a cut-glass bowl for Maggi, a floral melamine tray for snacks. Combos include a Coke/Diet Coke glass bottle as a consistent prop — nice unintentional brand cue. Props vary in style (rustic stoneware vs. floral china vs. cut glass) — not a matched set, but all "home plating," not fast-food trays, which reads more premium than the menu's price point. |
| **Color cast** | Warm/neutral white balance, no strong cast. Reds (sauces, chilli) and golds (fried, cheese) read true and appetizing. Greens (chutney, herbs) are a little muted/desaturated in a couple of shots. |
| **Resolution/quality** | Genuinely good — sharp focus, believable steam/oil sheen on the Maggi and pizza, no visible compression artifacts at the sizes checked. These are not amateur phone snaps; they're competent studio food photography. |
| **Consistency across set** | High on background (black) and general lighting mood; low on crop/fill ratio and prop styling. The pizzas (top-down, filled frame) look the most "menu-ready" as-is; the burger/sandwich (small, floating, lots of black) look the weakest as-is. |

**What this means for design direction:**
- **The black background is a gift, not a constraint fight it.** Any dark-UI direction (deep charcoal/near-black canvas) will make these photos look like they were shot *for* the site — no visible seam between photo edge and page background. A light/white UI direction would create a hard black rectangle around every single photo, which reads cheap and "pasted-in."
- **Heavy glassmorphism (frosted white/light blur panels) will fight the black backgrounds** — you'd get a light, milky card floating on a black photo inside a light page, three competing surfaces. Recommend against light-glass cards over these images.
- **A tinted, dark, low-opacity glass or simple solid-color card** (dark ember/charcoal card, thin warm border, no heavy blur) sitting *around* the photo — not over it — will read as unified and modern without fighting the black.
- **Crop inconsistency must be solved in CSS, not by re-shooting:** enforce one fixed aspect ratio + `object-fit: cover` + a consistent zoom/center crop per card so the small floating burger/sandwich shots fill their frame the same way the tight pizza shots do. This is the single highest-leverage, lowest-risk lever available (PRD explicitly names this).
- **A subtle uniform color grade** (slightly lift blacks to a warm near-black rather than pure `#000`, gentle warmth/contrast pass via CSS filter or a very light overlay) will smooth over the lighting-mood variance between shoots without touching the source files.
- Combo shots with the Coke bottle are the strongest "lifestyle" images in the set — good candidates for larger feature placements (combo strip, home page).

---

## 2. Current logo critique

Reviewed `The Oven vibe_logo.webp/avif` (square logo) and `The Oven Vibe_Hero_lable.webp/avif` (a Canva-style promo banner, not a logo file, but instructive).

**What it is today:** a flat brick-red/rust square, "THE OVEN VIBE" set in a bold display serif with rounded terminals (Canva-template energy — the kind of face that ships free in a "restaurant logo" pack), a thin script-style tagline ("From our oven to your box / Freshly backed daily" — note "backed" is a typo for "baked," worth fixing regardless of logo direction), and a chunky flat-outline oven icon sitting inside a scalloped speech/thought-bubble-cloud shape.

**Specific problems:**
1. **The oven-in-a-cloud motif doesn't parse.** A thought-bubble/speech-bubble is a communication metaphor, not a food or warmth metaphor — it reads as "the oven is thinking" or "the oven is speaking," which is not the intended message. It looks like a placeholder icon-pack asset rather than a drawn mark.
2. **Single flat color, no gradient/depth cue for heat.** For a brand whose whole pitch is "oven, fresh, hot," there's no flame, glow, warmth-gradient, or steam device doing that job — the only thermal cue is a literal appliance icon.
3. **Typeface is generic-decorative, not distinctive.** The display serif is a stock "trendy bakery" font with no custom letterforms — it won't be recognizable divorced from the color, and at small sizes the rounded serif details will mush together.
4. **Fails at favicon size.** At 16–48px the icon detail (oven knobs, cloud scallops, interior glow) will disappear into noise; only a solid red blob would survive, which isn't distinctive vs. any other red food-app icon.
5. **The "hero label" asset is a marketing banner, not a lockup** — it mixes three unrelated type styles (the logo serif, a rounded-sans tagline, a bold grotesque CTA line) plus a generic line-art pizza clip-art and a diagonal color-block split. It looks like an Instagram promo post, not a piece of a brand system, and shouldn't be treated as a logo asset at all in the rebuild.

**What's worth keeping (real equity, not throwaway):**
- **The rust/brick-red hue itself** — it's a good, appetite-appropriate red-orange, distinct from generic "Swiggy orange" or "Zomato red," and already has some real-world recognition (packaging, Instagram, GBP listing). Phase 2b should treat this hue family as an anchor to sample from, not necessarily hex-for-hex.
- **The oven-as-icon idea** — the instinct to use the oven itself (not a generic flame) is correct and differentiating for a brand literally named "The Oven Vibe"; it's the execution (cloud bubble, flat clip-art style) that's the problem, not the concept.
- **"The Oven Vibe" as a wordmark subject** — the name itself is warm, memorable, and food-native; it doesn't need a new name, just a new hand.

---

## 3. Pattern research (8 referenced patterns, why each converts)

| # | Pattern / reference | What it does | Why it converts (for THIS site) | Perf note |
|---|---|---|---|---|
| 1 | **21st.dev "card" components** — elevated product/media cards with image-fill top, content block bottom, subtle shadow-on-hover ([21st.dev/community/components/s/card](https://21st.dev/community/components/s/card)) | Fixed-ratio image top, name/price/CTA bottom, minimal chrome | Uniform crop + predictable tap target = the single biggest fix for this exact photo set; low visual noise keeps focus on the food | Pure CSS/Tailwind, zero JS cost |
| 2 | **Z-pattern menu layout** (top-left brand/logo → top-right hero item → bottom-left staples → bottom-right high-margin items) — standard 2026 digital-menu guidance ([usekodo.ai 50 restaurant menu ideas](https://usekodo.ai/guides/50-restaurant-menu-design-ideas-2026)) | Places the hero dish and high-margin combos where the eye naturally lands first | Directly usable for the home page: hero Paneer Makhni pizza top, combo strip in the "high-margin" position | Layout-only, no cost |
| 3 | **Dishoom-style editorial storytelling** (Awwwards-recognized) — large-format photography + short narrative captions, minimal chrome ([awwwards.com/websites/food-drink](https://www.awwwards.com/websites/food-drink/)) | Lets photography be 90% of the visual weight; type/UI recede | Matches the "appetite-first, photo-is-the-design" brief in PRD §8; validates going *light on UI decoration* rather than heavy glass | Static images, no motion required — cheap |
| 4 | **Sticky bottom cart/CTA bar** — standard mobile commerce pattern, measured 8–15% add-to-cart lift, higher on mobile ([easyappsecom.com sticky-add-to-cart](https://easyappsecom.com/guides/sticky-add-to-cart-best-practices)) | Keeps Call/WhatsApp/cart-total one thumb-reach away at all times | This *is* PRD §7's core mechanic — validates the sticky bar as the highest-leverage single UI element on the site | One small fixed-position element, no perf concern if not blurred |
| 5 | **Bento-grid category tiles** for home page ("Pizza / Burgers / Fried Rice / Snacks" as modular blocks) ([LogRocket "bento grids UX"](https://blog.logrocket.com/ux-design/bento-grids-ux/)) | Breaks the menu's 7 categories into scannable, differently-weighted blocks instead of a uniform list | Gives the hero dish and combo strip visual priority over minor categories without extra copy | CSS grid only — cheap; avoid nesting per-tile blur/parallax |
| 6 | **Liquid Glass (Apple 2025/26 native) vs. web "glassmorphism"** — liquid glass is *behavioral* (dynamic refraction, GPU-native), web glassmorphism is *static* (blur + translucency), and only the static version is honestly reproducible in CSS at acceptable cost on budget Android GPUs ([Design Signal](https://designsignal.ai/articles/glassmorphism-vs-liquid-glass), [Setproduct](https://www.setproduct.com/blog/liquid-glass-vs-glassmorphism)) | Sets expectations correctly: "liquid glass" as seen on iOS is not something this site can or should chase | Directly actionable: if any glass effect is used, keep it to 1–2 static, GPU-cheap `backdrop-filter: blur()` surfaces (e.g. sticky bar, nav), never stacked/animated glass on scrolling photo grids | Named risk in PRD §8/§13 — budget every blur |
| 7 | **Zomato's "personality-driven" visual language** — warm red brand color doing double duty as both UI accent and appetite cue, playful micro-copy over cold efficiency ([blakecrosley.com/guides/design/zomato](https://blakecrosley.com/guides/design/zomato)) | Shows a red-forward Indian food brand can feel warm/fun rather than corporate at scale | Validates keeping the existing rust-red hue family as the accent rather than defaulting to a colder "tech" palette | N/A (brand voice, not perf) |
| 8 | **2026 "toasty" food branding palettes** — oat/cream/terracotta/clay-pink/sage, engraved-linework and stamp/seal badges replacing flat clip-art icons ([Envato "Logo & Branding Trends 2026"](https://elements.envato.com/learn/logo-and-branding-trends), [Jellybean Creative](https://www.jellybeancreative.co.uk/2026/02/25/graphic-design-trends-2026/)) | Warm neutral + single saturated accent reads premium without needing bright multi-color UI | Directly informs the palette recommendation below and the logo direction in §4 | N/A |

**Mobile-perf flags for Phase 2b/3:** avoid animated/blurred glass on any scrolling surface (menu grid, cart bar included, if it scrolls with content); avoid parallax on more than the hero; bento-grid and card patterns above are CSS-only and safe on budget Android.

---

## 4. Logo/brand research

- **Wordmark vs. combination-mark trend:** 2026 food branding is swinging toward *bold custom wordmarks paired with a small, simple secondary mark* (not elaborate illustrated badges) — see the "bold typography" and "heritage/engraved" trends above. A combination mark (wordmark + compact icon that can also stand alone) is the right call here: PRD 2b explicitly needs a full lockup *and* a separate compact mark for favicon/app-icon use, which a pure wordmark can't provide alone.
- **Oven/flame/warmth motifs that survive simplification:**
  - *Flame/ember shape* — the most legible warmth cue at tiny sizes (a single teardrop/flame silhouette reads clearly at 16px; an oven-with-knobs illustration does not).
  - *Oven door arch* — an oven's rounded-rectangle door/window silhouette (not the whole appliance) can double as a friendly "O" in "Oven," which is a strong wordmark integration idea.
  - *Steam/heat wisp* — 1–2 simple curved lines above a shape read as "hot/fresh" without needing an illustrated dish.
  - *Avoid*: literal multi-part appliance illustrations (existing logo's mistake), speech/thought bubbles (communication metaphor, not food), photographic or gradient-mesh flame renders (won't reduce to flat SVG cleanly).
- **What survives at 16–48px (favicon test):** single bold silhouette, 1–2 colors max, thick strokes, no interior detail smaller than ~15% of the shape's bounding box, no text at all below ~32px. Rule of thumb used above: if you can't describe the icon in one clause ("a flame," "an oven arch with a glow"), it won't survive the favicon crop.

**Three concrete logo directions for "The Oven Vibe" (words only — Phase 2b draws these):**

1. **"Ember Arch"** — wordmark in a bold, slightly rounded custom-feeling grotesque/slab (not the current script-serif), with the letter **O** in "Oven" redrawn as a simplified oven-door arch containing a small solid ember/flame dot glowing warm-orange against the dark card color. Compact mark = just that arch-with-ember glyph, usable alone as favicon/app icon. Reads: modern, warm, literally "oven" without needing an appliance drawing.
2. **"Flame Mark + Clean Wordmark"** — a fully custom bold sans wordmark (confident, tight tracking, all-caps or title-case) sitting beside (not merged with) a small abstract flame/ember mark — a single smooth teardrop shape, one color, no outline detail. This is the safest, most legible-at-all-sizes option and the closest to "toasty logo" 2026 trend language (warm neutral wordmark + one saturated accent shape). Compact mark = the flame teardrop alone.
3. **"Stamp/Seal Badge"** — leans into the "heritage/engraved badge" 2026 trend: a circular badge (like a bakery stamp) with "THE OVEN VIBE" set in an arc, a simple flame or oven-arch glyph centered, thin ring border. Works well as a social-media avatar and instagram-QR companion mark but is the riskiest at true favicon size (circular badges lose their ring detail below ~32px) — would need a simplified flat version for the actual favicon file.

**Recommendation between the three:** direction 1 or 2 for the primary lockup + favicon (both pass the favicon test cleanly); direction 3, if desired at all, should be a secondary social/avatar asset, not the favicon source.

---

## 5. Recommendation (opinionated)

**Overall style direction: dark, warm-neutral "Editorial Ember" — not glassmorphism, not full editorial-minimalism, a specific hybrid.**

The photos settle this: every single one is shot on black. A dark canvas (deep warm charcoal, not pure black, so the site doesn't look like a photo-editing tool) removes the visible seam between photo and page entirely, and is exactly the treatment PRD §8 hints at ("dark, warm-neutral base tends to make food photos pop"). Full glassmorphism is the wrong call over these images specifically — light frosted panels on top of black-background photos create three competing surfaces (light glass / black photo / page). Instead: solid or near-solid warm-charcoal cards with a thin ember-colored hairline border, generous whitespace between cards (not blur *inside* them), and the Dishoom-style editorial habit of letting photography be ~85% of the visual weight with type kept large, confident, and quiet everywhere except price and CTAs. One restrained glass surface is fine — the sticky Call/WhatsApp bar only — because it's a single static element, not a stack of blurred cards on a scrolling grid, and it stays within the PRD's blur budget.

**Proposed palette family (character, not tokens — 2b locks exact hex):** deep warm charcoal/near-black base (not pure `#000`, keep a whisper of brown-red in it) · the existing brick/rust red as the one saturated accent (keeps real brand equity, do a level of contrast-boost for AA on dark) · a warm cream/off-white for body text (not stark white — reduces glare on budget-Android AMOLED screens and echoes the 2026 "toasty" neutral trend) · a small ember-orange or amber as a secondary highlight for prices/CTAs so red isn't doing every job alone.

**Font-pair character (not final faces — 2b locks fonts):** one confident, slightly characterful **display/slab or bold grotesque** for the wordmark and big headlines (bold enough to read as "custom," not a stock script-serif like today's logo) paired with a **clean, highly legible humanist sans** for body copy, prices, and UI chrome — optimized for small sizes on budget Android screens over 4G, self-hosted, no more than two weights loaded beyond the display face's single weight.

**Which two directions Phase 2b should build:**
1. **"Ember Editorial"** (primary recommendation, build first and build fully) — the dark warm-charcoal system described above: uniform-crop photo cards with hairline ember borders, bento-style category grid, sticky glass-lite CTA bar, logo direction 1 ("Ember Arch") or 2 ("Flame Mark") as the matched lockup.
2. **"Fresh Counter, warmed up"** (contrast direction, per PRD's own A/B ask) — light editorial background but *not* stark white: warm cream/oat page color (not `#fff`) so the black-background photos still sit inside a warm frame rather than a cold one, sharp bordered cards (no blur at all), bold slab headlines, same accent red. This gives Milan a genuine light-vs-dark choice without ever forcing a stark-white card around a black photo, which is the one combination this research rules out entirely.

Both directions should carry the **same logo concept** (whichever of directions 1/2 in §4 Milan prefers) and the same accent-red family — the axis of choice for Milan is light-vs-dark canvas and card treatment, not brand identity.
