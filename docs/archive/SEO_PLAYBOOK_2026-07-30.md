# SEO Playbook — The Oven Vibe

Written at the end of Phase 4 (2026-07-30). Two parts:

- **Part A** — what the website now does on its own. Done; no action needed.
- **Part B** — what only Milan can do, ranked. This is where the traffic actually
  comes from. The honest summary up front: **the website was never the reason
  there was no traffic, and fixing the website is not what will bring it.**

---

## Part A — What the site now does

| Area | State after Phase 4 |
|---|---|
| Titles & descriptions | Unique per page, ≤ 60 / ≤ 155 chars, written for real local queries ("pure veg pizza Sundargarh", "food delivery Sundargarh 770001", "pizza under ₹300"). |
| One SEO component | `src/components/Seo.astro` emits canonical + Open Graph + Twitter + one JSON-LD `@graph` for every page, driven by `<Layout>` props. A new page cannot ship without them. |
| Structured data | `Restaurant`+`LocalBusiness` with geo, `openingHoursSpecification`, `areaServed` (8 km GeoCircle), `priceRange`, telephone, address, `servesCuisine` incl. `Vegetarian`, `sameAs` (Instagram, Google Business Profile, Zomato, Swiggy). Plus full `Menu`/`MenuSection`/`MenuItem` generated from `menu.json` — 8 sections, 37 items, each with its price and `suitableForDiet: VegetarianDiet`. Plus `FAQPage`, `BlogPosting` (×5), `BreadcrumbList`, `Blog`, `WebSite`, `Organization`. |
| Ratings | Only the real Google figure — 4.9 / 16 — read from `site.config.json`. v1's fabricated 4.9/**120** and three fake "Local Customer" reviews are gone from the codebase entirely. A build-time check fails if any other number appears. |
| Pure veg positioning | Stated in the `<title>`/description, a CSS-drawn "100% Pure Veg" badge on home / menu / contact / local page / footer, a dedicated "Why we picked one side" blog post, `servesCuisine`, and per-item diet markup. |
| Copy | All emoji removed from rendered UI. Catalogue noise (`[Regular, 7 inches]`, `[Veg preparation]`, chef/chilli emoji) is cleaned at render time in `src/lib/data.ts` — `menu.json` itself is untouched, since it mirrors the Zomato catalogue. Size and spice level survive as a muted line under each item name, because those are real buying information. |
| Internal linking | Every blog post now links to `/menu/` and `/sundargarh/`; the local page links to `/menu/` and `/faq/`. v1 had almost no internal links between content and money pages. |
| Facts consistency | Hours, delivery slabs, phone, price range and the address all come from `site.config.json` / `menu.json`. Three places on v1 stated three different opening times; that is now structurally impossible. |
| Local landing page | `/sundargarh/` was three buttons and one sentence. It is now a real page: H1 on "Food delivery in Sundargarh 770001", delivery-slab explanation, category highlights with live "from ₹x" prices, four quick answers, call CTA. Nothing on it is invented — every fact traces to the config. |
| Old URLs | The nine v1 URLs (`faq.html`, `contact.html`, `sundargarh-770001.html`, `blog*.html`) still resolve, via meta-refresh + canonical. Phase 4 removed the `noindex` they carried: `noindex` next to a cross-page canonical tells Google to *drop* the old URL rather than fold its history into the new one — the opposite of what a redirect stub is for. |
| Sitemap / robots | `sitemap-index.xml` generated at build, all 11 real routes present, referenced from `robots.txt`. |
| Images | Every `<img>` has descriptive alt text; menu photos use the cleaned item name. AVIF + WebP with explicit dimensions. OG images declare width/height/alt. |

**What the site cannot do:** rank you in the Google map pack. That is Part B.

---

## Part B — What only Milan can do, and what's actually missing

Ranked by how much traffic each one is worth for a Sundargarh food business.
Every item says what, why, how, and how often.

### 1. Google Business Profile is 90% of "pizza near me". Treat it as the product.

**Why this is #1, and why "advanced SEO" on the site didn't move anything:**
when someone in Sundargarh searches "pizza near me" or "food delivery
Sundargarh", Google answers with the **map pack** — three business profiles with
photos, ratings and a Call button — *above* any website result. Those three slots
are chosen from Business Profiles, using proximity, category relevance, and
engagement signals on the profile itself. A perfectly marked-up website is a
*supporting* signal for that ranking; it is not the thing being ranked. Perfect
site SEO with a thin profile loses to a mediocre site with an active profile,
every single time.

You already have the hard part: the profile is claimed and verified, 4.9 with 16
reviews. What is missing is activity.

**What to do:**

- **Categories.** Primary category should be the one that matches the query you
  want: `Pizza restaurant` or `Pizza delivery`. Add secondaries: `Fast food
  restaurant`, `Vegetarian restaurant`, `Delivery service`. The primary category
  has more ranking weight than anything else on the profile — check it today.
  *(One-time, 10 minutes, then review every 6 months.)*
- **Attributes.** Turn on `Vegetarian options` / "Serves vegetarian dishes",
  `Delivery`, `Takeaway`, `No dine-in`. These feed Google's filter chips.
  *(One-time.)*
- **Photos — weekly, non-negotiable.** Profiles that get new photos get more
  views and more direction requests. Post 2–3 real phone photos a week: the pizza
  coming out of the oven, a packed order, the box on someone's table. Not
  catalogue shots — those are already there. **Weekly.**
- **Google Posts.** A short post whenever there is something true to say: a new
  item, a combo, festival timings, "closed today". Posts expire after ~7 days.
  **Weekly, or at least twice a month.**
- **Menu link.** Add `https://theovenvibe.github.io/menu/` as the profile's menu
  URL, and the same as the website. That page is generated from `menu.json`, so it
  is never out of date. *(One-time.)*
- **Q&A.** Google lets anyone ask a question on your profile — and lets *you*
  ask and answer. Seed the eight questions from `/faq/` yourself, answered.
  This is free control over what people read before calling. *(One-time,
  30 minutes; check for new questions monthly.)*
- **Hours accuracy.** 11 AM – 9 PM, all days, and special hours entered before
  every festival closure. Wrong hours are the fastest way to earn a 1-star.
  **Before every holiday.**

### 2. Review velocity — the single biggest lever you are not pulling

**Why:** 16 reviews at 4.9 is a good rating and a *weak* volume. Ranking in the
map pack weighs review count and recency, not just the average. A competitor with
80 reviews at 4.3 will usually outrank you. And reviews mentioning "pizza",
"veg", "Sundargarh" literally teach Google what you are.

**How:** ask every single customer, at the moment they are happiest — when they
collect a hot box, or in the WhatsApp thread right after delivery.

- Get your review short-link from the profile ("Ask for reviews" → copy link).
- Paste it as the **last message of every WhatsApp order thread**: "Thanks! If
  the food was good, a quick Google review really helps us: <link>". That is one
  copy-paste per order and it is the whole strategy.
- Print the same link as a QR sticker on the takeaway boxes.
- **Target: 5–8 new reviews a month.** At that rate you pass 80 reviews inside a
  year, which is the point where volume stops being your weakness.
- Never buy reviews and never post them yourself. Google detects review-velocity
  anomalies, and the site already got burned once by fabricated ratings (see #7).

**Respond to every review, good and bad, within 48 hours.** Responses are a
ranking-relevant engagement signal and they are read by every future customer.
For a bad one: apologise, state what you changed, offer to make it right. Never
argue.

### 3. Instagram → website, and geotagged reels

**Why:** Instagram is where your audience already is, and it is currently a
dead end — nothing points from it to the site or the profile.

- **Bio link:** `theovenvibe.github.io` (later the custom domain). Right now the
  bio should point somewhere; the site is the only place with the full menu and
  prices. *(One-time.)*
- **Geotag every post and reel** with Sundargarh. Location-tagged content is how
  people browsing "Sundargarh" on Instagram find you.
- **Reels cadence: 2–3 per week.** The formats that work for a kitchen are
  boring and effective: cheese pull, pizza going into the oven, order being
  packed, 15 seconds, no music licensing drama. Cross-post to the Business
  Profile as a photo/post.
- Put the phone number in the bio as tappable text; most people will call rather
  than DM.

### 4. Local citations — get your name and number on the sites Google cross-checks

**Why:** Google confirms a local business exists by finding the same **N**ame,
**A**ddress, **P**hone in several independent places. Inconsistent or missing
citations weaken the profile's confidence score.

- Create/claim: **Justdial**, **Sulekha**, **IndiaMART**, **Bing Places**,
  **Apple Business Connect**, **Yellow Pages India**, plus any Sundargarh
  district or Odisha food directory you can find.
- **NAP must be byte-identical everywhere**, matching the Business Profile
  exactly. Same spelling, same abbreviation, same phone format.
- ⚠️ **Do this first:** the street line the site publishes is
  `Bijaya Talkies Road, In front of Subasini Clinic` (carried over from v1 and
  now stored in `site.config.json` → `business.address.street`). **Confirm it
  matches the Business Profile word-for-word.** If it does not, fix it in
  `site.config.json` — one edit, one commit, every page and every schema block
  updates. Do not let two versions of the address exist.
- *(One-time push over a weekend; then only when the phone number changes.)*

### 5. WhatsApp Business catalogue

**Why:** WhatsApp is already how most orders arrive. A Business account turns
that thread into a storefront, and it costs nothing.

- Switch to **WhatsApp Business** (free app, same number).
- Build the **catalogue**: item name, price, photo — the same items as
  `menu.json`. Customers can browse and send an order without you typing prices.
- Set a **greeting message** with hours and the delivery slabs, and an
  **away message** for after 9 PM. Half your "no reply" complaints disappear.
- Add **quick replies** for the three things you type every day: delivery
  charges, timings, party-order questions.
- *(Setup: one evening. Update the catalogue whenever `menu.json` changes.)*

### 6. Why `theovenvibe.github.io` has a ceiling — and when to buy the domain

**Be clear about this, because it explains part of why "advanced SEO" underperformed.**

`theovenvibe.github.io` is a **subdomain of github.io**, a domain shared by
millions of unrelated projects. Concretely:

- It reads as a hobby project to a human deciding whether to trust a food
  business with a phone order. That is a conversion problem before it is a
  ranking problem.
- You cannot use it as an email domain, so `theovenvibe@gmail.com` is your
  business address — another trust signal working against you.
- Local directories and some aggregators treat free-host URLs as lower quality.
- Google says it treats subdomains on their own merits, and that is broadly true
   — but every branded query ("the oven vibe sundargarh") is competing with a URL
  that doesn't contain your brand as the domain.

**What it does *not* explain:** github.io is not why you have no traffic. The map
pack was always going to outrank a website for "pizza near me". Buy the domain
because it makes the business look real, not because it will move rankings much.

**When:** as soon as you have the ₹700–1,000/year — this is the cheapest
credibility upgrade available. `theovenvibe.in` or `.com`.

**How it lands technically:** the whole codebase reads one constant (`SITE_URL`
in `astro.config.mjs`). Changing the domain is that one line, a `CNAME` file, and
DNS. Every canonical, sitemap entry and JSON-LD URL follows automatically. Then:
add the new property in Search Console, keep the old github.io host alive so its
pages 301/canonical to the new one, and update the domain everywhere in Part B
items 1–5.

### 7. Search Console — and one specific clean-up request

**Why:** without it you are guessing. Search Console is the only place that tells
you which queries you actually appear for, at what position, and whether Google
can index the pages.

**Do this immediately after v2 goes live:**

1. Add the property for `https://theovenvibe.github.io/` and verify (HTML tag in
   `Layout.astro`, or the DNS method once you own a domain).
2. **Submit `https://theovenvibe.github.io/sitemap-index.xml`.** *(One-time.)*
3. **Request re-crawl (URL Inspection → "Request indexing") for the home page
   and `/faq/`.** This one matters more than it sounds: v1 shipped a **fabricated
   `aggregateRating` of 4.9 from 120 reviews plus three invented customer
   reviews** in its structured data, and that markup has been live and crawlable.
   Fake review markup is a documented structured-data violation and can get rich
   results suppressed for the whole site. Phase 4 removed it and replaced it with
   the real 4.9/16. Re-crawling is how you tell Google the violating markup is
   gone rather than waiting months for a natural re-crawl.
4. Check **Coverage / Pages** a week after launch: all 11 routes indexed, no
   unexpected "Excluded" entries, and the nine old URLs showing as
   redirects/canonicalised rather than errors.
5. Run each page type once through the **Rich Results Test** and the
   **Schema Markup Validator** — home, `/menu/`, `/faq/`, one blog post.
6. Then: **look at the Performance report once a month.** Queries you rank 8–20
   for are your content roadmap — that is what the next blog post should be about.

*(Setup: 30 minutes. Monthly review: 15 minutes.)*

### 8. Blog: 1 post a month, answering a real question

Five posts exist and they now target genuine local queries. The pattern that
works: pick a question people actually type, answer it better than anyone local
has, link to `/menu/` and `/sundargarh/`. Use `skills/add-blog-post.md`.

Ideas that fit the business and require no invention: "party order for 20 people
in Sundargarh — what it costs", "what to order for an office lunch",
"pure veg options for a festival at home", "combo vs individual items: which is
actually cheaper".

**One post a month is plenty.** Four good posts a year beat twenty thin ones.

### 9. Realistic timeline — so nobody concludes "SEO doesn't work" in week three

| When | What to expect |
|---|---|
| Week 1–2 | Pages indexed. Branded searches ("the oven vibe") show the new site. Nothing else changes. |
| Week 3–6 | Business Profile activity (photos, posts, new reviews) starts moving map-pack position for a few queries. This is where the results come from, and it is *not* the website. |
| Month 2–3 | Long-tail pages begin to appear: "pizza under 300 Sundargarh", "pure veg pizza Sundargarh", "food delivery sundargarh 770001". Low volume, high intent. |
| Month 3–6 | If reviews kept growing (5–8/month) and photos kept going up, the profile competes for the head terms — "pizza near me", "food delivery Sundargarh". |
| Month 6+ | Compounding. New posts rank faster; the profile is established. |

**The two things that decide whether this works** are review velocity and profile
activity — items 1 and 2. Both are weekly habits, not projects. Everything else on
this list is worth doing and none of it substitutes for those two.

**And the blunt version of the "advanced SEO didn't work" diagnosis:**

1. The traffic for these queries lives in the map pack, and the profile was
   inactive — no posts, no fresh photos, 16 reviews, likely wrong or missing
   primary category. Site markup does not compete for those slots.
2. The site's own facts contradicted each other (three different opening times,
   a "late night" blog post from a kitchen closing at 9 PM, "team Veg or team
   Non-Veg" copy from a 100% pure veg kitchen). Contradiction destroys the
   topical clarity that ranking depends on.
3. The FAQ markup did not match the visible FAQ answers — invalid, and ignored.
4. The structured data carried a fabricated rating, which is a violation, not an
   optimisation.
5. The site was an island: no internal links between content and menu, no link
   from Instagram, no citations, `noindex` on its own redirect stubs.

Items 2–5 were website problems and are fixed. Item 1 is not a website problem,
and it is the big one.
