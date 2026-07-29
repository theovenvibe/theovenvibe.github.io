# Skill: add-blog-post

Add a brand-new blog post. Each post is its own Astro page file (there is
no markdown content collection here — every post is a `.astro` file using
the shared `BlogPostLayout` component). This skill covers: picking a
slug, the image, the page file (template inline below), and linking it
from the blog index.

## 1. Pick a slug (the URL)

The post's URL will be `/blog/<slug>/`. Rules:
- lowercase, words separated by hyphens, no spaces, no special characters
- short and descriptive of the topic, e.g. `party-order-for-20-people`
- must not already exist under `src/pages/blog/` (check
  `ls src/pages/blog/` first)
- once published, NEVER change a slug later — that breaks the URL
  everywhere it's been shared (Instagram bio, Google index, WhatsApp)

## 2. Pick the next blog image number

Look in `public/static/images/blog_images/` and find the highest existing
`blog_N.webp`/`.avif` pair (currently `blog_1` through `blog_10` exist —
some numbers are already used by the 5 live posts, some are spares).
Use the next number that has NO existing `.astro` post referencing it —
grep first:
```bash
grep -rn "blog_images/blog_" src/pages/blog/*.astro
```
Pick a number not in that list, e.g. `blog_11`.

## 3. Add the header image

Photo criteria: square (1024×1024 matches the existing set), black
background is not required for blog headers (unlike food photos) but
should look clean and on-brand. Full conversion commands:
`skills/update-item-photo.md` §3. Result:
```
public/static/images/blog_images/blog_11.webp   ← required
public/static/images/blog_images/blog_11.avif   ← optional
```

## 4. Generate the OG share image (required before merge)

Every post needs a 1200×630 JPEG for link previews. Follow
`skills/update-item-photo.md` §6 "square photo" recipe:
```bash
sips -s format jpeg -z 1200 1200 public/static/images/blog_images/blog_11.webp --out /tmp/step1.jpg
sips -c 630 1200 /tmp/step1.jpg --out public/static/images/og/blog_11.jpg
```
Confirm it's exactly 1200×630:
```bash
sips -g pixelWidth -g pixelHeight public/static/images/og/blog_11.jpg
```

## 5. Create the page file — copy this template exactly

Create `src/pages/blog/<slug>.astro` (example slug: `party-order-guide`)
with this exact structure, then fill in the placeholders marked `TODO`:

```astro
---
// /blog/party-order-guide/ — new post (skills/add-blog-post.md).
import Layout from '../../layouts/Layout.astro';
import BlogPostLayout from '../../components/BlogPostLayout.astro';
import { site } from '../../lib/data';
import { LINKS, abs, blogPostingJsonLd, breadcrumbJsonLd } from '../../lib/seo';

const headline = 'TODO: Full Post Title, Title Case';
const description =
  'TODO: one or two sentences, <=155 characters, written for a real local search query.';
const image = {
  url: abs('/static/images/og/blog_11.jpg'),
  width: 1200,
  height: 630,
  alt: 'TODO: describe the photo for screen readers / SEO',
};
const path = '/blog/party-order-guide/';
---

<Layout
  title={headline}
  description={description}
  ogType="article"
  image={image}
  jsonLd={[
    blogPostingJsonLd({
      headline,
      description,
      path,
      image: image.url,
      datePublished: 'TODO: YYYY-MM-DD, today, never invent an earlier date',
    }),
    breadcrumbJsonLd([
      { name: 'Blog', path: '/blog/' },
      { name: 'TODO: short breadcrumb label', path },
    ]),
  ]}
>
  <BlogPostLayout
    line1="TODO: FIRST WORD(S)"
    lineGradient="SECOND PART."
    subtitle="TODO: one-line subtitle under the big heading."
  >
    <picture>
      <source type="image/avif" srcset="/static/images/blog_images/blog_11.avif" />
      <source type="image/webp" srcset="/static/images/blog_images/blog_11.webp" />
      <img
        src="/static/images/blog_images/blog_11.webp"
        alt="TODO: same alt as above"
        class="blog-img"
        loading="lazy"
        width="1024"
        height="1024"
        style="background: #eee"
      />
    </picture>

    <p>
      TODO: opening paragraph — answer the reader's actual question in the first
      2-3 sentences, no throat-clearing.
    </p>

    <h3>TODO: a subheading</h3>
    <p>TODO: body copy.</p>
    <ul>
      <li>TODO: bullet</li>
      <li>TODO: bullet</li>
    </ul>

    <h3>The Oven Vibe, Sundargarh's pure veg cloud kitchen</h3>
    <p>
      We run 100% pure veg in {site.business.address.locality} {site.business.address.postal_code} — no meat, fish or
      egg is cooked, stored or handled in the kitchen. Open {site.business.hours.display}.
    </p>

    <p>
      TODO: closing line, then link to <a href="/menu/">the full menu</a> and/or
      <a href="/sundargarh/">delivery in Sundargarh {site.business.address.postal_code}</a>.
    </p>

    <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" class="cta">
      Order on WhatsApp
    </a>
  </BlogPostLayout>
</Layout>
```

Rules for the copy (binding, same as every other page):
- 100% pure veg kitchen — never write "non-veg", "chicken", "egg",
  "mutton", "fish", "prawn", "keema" as something the kitchen serves.
- No emoji anywhere in the visible copy (AGENTS.md golden rule #7).
- Every fact (hours, delivery charges, prices) must come from
  `site.business.*` / `site.delivery.*` / `menu.json` — never hand-type a
  number that could drift from the config (AGENTS.md golden rule #8).
- `datePublished` must be a real date (today, or when you're backfilling,
  the real publish date) — never invented or backdated for SEO effect.

## 6. Add a card to the blog index

Open `src/pages/blog/index.astro`, find the `<!-- Blog Card N -->` blocks
(each is one `<article class="blog-card ...">`). Copy the most recent
one, paste it right after, and change: the two `srcset`/`src` image
paths (to `blog_11`), the `alt` text, the `<h3>` headline, the `<p>`
summary, and the `href` (to `/blog/party-order-guide/`). Keep the
`animate-on-scroll delay-NNN` class pattern consistent with its neighbors
(each card increases the delay by 100).

**Note:** the desktop nav's Blog dropdown (`src/components/Nav.astro`)
only ever lists 2 of the 5 existing posts — this is a known v1 quirk kept
intentionally for pixel parity (see PROGRESS.md Phase 3). You do NOT need
to add your new post there; the `/blog/` index card is what makes the
post discoverable and indexed.

## 7. Verify

```bash
npm run build
```
Expect the new route in the output, e.g.:
```
├─ /blog/party-order-guide/index.html
```
and `Result (N files): 0 errors`. Then run the QA checks in
`skills/qa-check.md` (JSON-LD parses, no emoji, title/description length)
before merging — a new page is exactly the case that check exists for.

If it fails, the error usually names a missing import or a typo in the
JSON-LD helper call — read the first error Astro prints, not the last.
Still stuck → `skills/troubleshoot-build.md`.

## 8. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/add-blog-post-party-order origin/develop
# ... add images, create the page, add the index card ...
npm run build
git add src/pages/blog/party-order-guide.astro src/pages/blog/index.astro \
  public/static/images/blog_images/blog_11.webp public/static/images/blog_images/blog_11.avif \
  public/static/images/og/blog_11.jpg PROGRESS.md
git commit -m "feat(blog): add 'party order guide' post"
git push -u origin feature/add-blog-post-party-order
```
Then merge per `skills/release-manager.md` §5.

## 9. Editing from a phone (GitHub web editor)

This one is easiest to draft on a computer (multiple new files), but the
web editor still works:
1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. Upload the two image files under `public/static/images/blog_images/`
   and the OG jpg under `public/static/images/og/` (commit to a new
   branch, e.g. `add-blog-post`).
3. Navigate to `src/pages/blog/`, tap **Add file → Create new file**,
   name it `<slug>.astro`, paste the filled-in template from step 5,
   commit to the SAME branch.
4. Open `src/pages/blog/index.astro` on that branch, tap the pencil icon,
   paste in the new card block from step 6.
5. Go to **Pull requests → Compare & pull request**.
6. Check the "Checks" tab after ~1–2 minutes: green = safe to merge.
