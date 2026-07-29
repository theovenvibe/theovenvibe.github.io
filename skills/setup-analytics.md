# Skill: setup-analytics

Turn on Umami Cloud analytics. This is the ONE task in `skills/` meant
for **Milan (the owner)**, not an editing agent — it starts with creating
an account on a website outside this repo. Once the owner has an ID, the
repo-side paste-in step at the end is a normal config edit any agent can
do.

## Why Umami

PRD §5 (binding): Umami Cloud, cookie-less, no cookie-consent banner
needed, tracks `call_click` and `wa_click` (already wired in
`public/scripts/site.js`, Phase 5). v1's Google Ads gtag / GTM / Yandex
Metrika trackers were dropped for good and are not coming back.

## 1. Create the Umami Cloud account (owner, ~2 minutes)

1. Go to `https://cloud.umami.is`.
2. Sign up (email or GitHub login — GitHub login is simplest since
   you're already using GitHub for this repo).
3. Confirm the account (check email for a verification link, if asked).

## 2. Add the website (owner, ~1 minute)

1. Inside the Umami dashboard, go to **Websites → Add website**.
2. **Name:** `The Oven Vibe`.
3. **Domain:** `theovenvibe.github.io` (update this later if/when the
   custom domain from `docs/SEO_PLAYBOOK.md` Part B §6 is bought).
4. Save.

## 3. Copy the Website ID (owner, ~1 minute)

1. Click into the website you just created.
2. Go to **Settings → Websites**, click the site, and find the
   **Website ID** (a long string like
   `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
3. Copy it — this is the ONLY value that needs to come back to this
   repo. Do not copy the whole `<script>` tag; just the ID.

## 4. Paste the ID into the repo (owner or an agent — normal config edit)

Open `site.config.json` (repo root), find:
```json
"analytics": {
  "umami_website_id": ""
}
```
Paste the ID between the quotes:
```json
"analytics": {
  "umami_website_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```
Then follow the normal edit flow:
```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/enable-analytics origin/develop
# ... paste the ID as above ...
npm run build
git add site.config.json PROGRESS.md
git commit -m "feat(analytics): enable Umami Cloud"
git push -u origin feature/enable-analytics
```
Expect `npm run build` to print `Result (N files): 0 errors`. If it fails
instead, the only thing that can be wrong here is the ID's shape (letters,
numbers, hyphens only — an error will say
`site.config.json → analytics.umami_website_id: ...`); fix the paste and
re-run. Still stuck → `skills/troubleshoot-build.md`.

Then merge per `skills/release-manager.md` §5.

**From a phone (GitHub web editor):** same as any other `site.config.json`
edit — see `skills/update-hours-or-contact.md` §9 for the exact
tap-by-tap flow (open file → pencil icon → edit → commit to a new branch
→ pull request → check "Checks" tab → merge).

## 5. Verify it's live (owner, after the change is merged and deployed)

1. Visit the live site.
2. In the Umami dashboard, go to the website's **Realtime** view.
3. Your own visit should appear within a few seconds. Tap a `tel:` link
   or a WhatsApp link on the site — `call_click` / `wa_click` events
   should appear in Umami's **Events** tab within about a minute.

If nothing appears: confirm the ID was pasted correctly (no extra spaces,
no quotes duplicated) and that `npm run build` succeeded after the edit —
an empty ID means the script is never added to the page at all (this is
intentional: `analytics.umami_website_id: ""` = analytics fully off, see
`src/layouts/Layout.astro`).

## Turning analytics back off

Set `umami_website_id` back to `""` (empty string), rebuild, commit. The
Umami `<script>` tag disappears from every page — no residual tracking
code is left behind.
