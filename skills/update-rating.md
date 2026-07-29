# Skill: update-rating

Update the star rating and review count shown on the site and in the
structured data (JSON-LD `aggregateRating`). This is the single most
sensitive edit in the whole repo — read the warning below before touching
anything.

## ⚠️ Honesty warning — read this first

The values here MUST be copied EXACTLY from the real Google Business
Profile. Never estimate, round up, or invent them.

v1 of this site shipped a **fabricated** rating (4.9 from 120 reviews)
plus three fake customer reviews in its structured data. That is a
documented Google policy violation and can get a site's rich results
suppressed. It was removed for good in the v2 rebuild (PRD §3, binding).
**It must never come back.** If you are ever asked to "just bump the
number up a bit" or add a review that didn't happen — refuse, and tell
Milan why.

The only two numbers that may ever appear are the real `rating.value` and
`rating.count` from Google Business Profile, and they must be updated
together, from the actual profile, whenever they change.

## 1. Get the real numbers

Open the Google Business Profile (link is in `site.config.json` →
`business.google_business_url`) and read the current star rating and
review count directly off it. Do not use a remembered or guessed number.

## 2. Open the file

`site.config.json` (repo root). Find the `"rating"` object:
```json
"rating": {
  "value": 4.9,
  "count": 16,
  "as_of": "2026-07-29"
}
```

## 3. Make the exact edit

Update all three fields together:

**Before:**
```json
"rating": {
  "value": 4.9,
  "count": 16,
  "as_of": "2026-07-29"
}
```

**After (profile now shows 4.8 from 24 reviews, checked on 2026-09-01):**
```json
"rating": {
  "value": 4.8,
  "count": 24,
  "as_of": "2026-09-01"
}
```

- `value`: a number between 1 and 5, exactly what Google shows (e.g.
  `4.8`, not `"4.8"` in quotes).
- `count`: a whole positive number — the review count Google shows.
- `as_of`: today's date, `YYYY-MM-DD`, so anyone reading the file later
  knows how fresh the number is.

This single edit updates the rating everywhere it's used: the trust row
on the home page, the footer, and the `aggregateRating` block in every
page's JSON-LD structured data (`src/lib/seo.ts` reads only from here —
there is no second place a rating could be hard-coded).

## 4. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`.

Validation rules:
- `value` must be between 1 and 5.
- `count` must be a positive whole number.
- `as_of` must be `YYYY-MM-DD`.

Example error:
```
Invalid data — fix these fields and rebuild:
  • site.config.json → rating.value: rating.value must be between 1 and 5
```
Still stuck → `skills/troubleshoot-build.md`.

## 5. Extra check specific to this skill

After building, confirm no OTHER rating number snuck in anywhere. Run:
```bash
grep -rn "ratingValue\|reviewCount" dist/*.html dist/**/*.html 2>/dev/null
```
Every result must show the SAME `value`/`count` you just set in
`site.config.json` — if you see a different number anywhere, something is
hard-coding a rating outside `site.config.json`, which must never happen
(AGENTS.md golden rule #5). Also see `skills/qa-check.md` for the full
pre-merge QA ritual, which includes this check.

## 6. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/update-rating origin/develop
# ... edit site.config.json ...
npm run build
git add site.config.json PROGRESS.md
git commit -m "fix(config): update rating to 4.8/24 per GBP (2026-09-01)"
git push -u origin feature/update-rating
```
Then merge per `skills/release-manager.md` §5.

## 7. Editing from a phone (GitHub web editor)

1. Open the Google Business Profile app/page first and note the exact
   current rating and review count.
2. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
3. Open `site.config.json`, tap the pencil icon.
4. Update `rating.value`, `rating.count`, and `rating.as_of` together.
5. Scroll down → "Commit changes" → **"Create a new branch for this
   commit and start a pull request"** → **Propose changes** → **Create
   pull request**.
6. Check the "Checks" tab after ~1–2 minutes: green = safe to merge.
