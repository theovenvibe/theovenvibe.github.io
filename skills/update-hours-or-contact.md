# Skill: update-hours-or-contact

Change opening hours, phone number, WhatsApp number, email, address, or
Instagram/Google Business links. All of it lives in `site.config.json` →
`business`, never hard-coded in a page.

## 1. Open the file

`site.config.json` (repo root). Find the `"business"` object.

## 2. Current shape (for reference)

```json
"business": {
  "name": "The Oven Vibe",
  "tagline": "Fresh, hot, oven-baked — made in Sundargarh",
  "phone": "+919692261138",
  "phone_display": "+91 96922 61138",
  "whatsapp": "919692261138",
  "email": "theovenvibe@gmail.com",
  "address": {
    "street": "Bijaya Talkies Road, In front of Subasini Clinic",
    "locality": "Sundargarh",
    "region": "Odisha",
    "postal_code": "770001",
    "country": "IN",
    "latitude": 22.117,
    "longitude": 84.0382
  },
  "hours": {
    "open": "11:00",
    "close": "21:00",
    "days": "Mo-Su",
    "display": "11 AM – 9 PM, all days"
  },
  "instagram": "https://instagram.com/theovenvibe",
  "google_business_url": "https://share.google/wlwoG9JmeY3KV3dWU"
}
```

## 3. Hours

Two fields must both be updated together — they are NOT auto-generated
from each other:
- `hours.open` / `hours.close`: 24-hour `HH:MM`, used by the `tel:`-style
  machine-readable JSON-LD (Google reads this to know if you're "open
  now"). Example: `"11:00"`, `"21:00"`.
- `hours.display`: the human sentence shown on the page, e.g.
  `"11 AM – 9 PM, all days"`. Update the wording to match the new
  open/close times.

**Before → after (closing time moved to 10 PM):**
```json
"hours": {
  "open": "11:00",
  "close": "22:00",
  "days": "Mo-Su",
  "display": "11 AM – 10 PM, all days"
}
```
(`close` AND `display` both changed — this is the one mistake to avoid:
changing only one of the two.)

## 4. Phone / WhatsApp

- `phone`: format `+91` then 10 digits, no spaces, no other symbols.
  Example: `"+919692261138"`.
- `phone_display`: the same number, formatted for humans to read, e.g.
  `"+91 96922 61138"`.
- `whatsapp`: format `91` then 10 digits — no `+`, no spaces. Example:
  `"919692261138"`. This is used to build every `wa.me` link on the site.

Change all three together when the number changes; they must all
describe the same phone number.

## 5. Email / Address / Social links

- `email`: must be a valid email address.
- `address.street`: **must match the Google Business Profile street line
  word-for-word** — this is a real local-SEO signal (mismatched addresses
  hurt Google ranking). Never guess this value; copy it from the Business
  Profile.
- `address.locality`, `address.region`, `address.postal_code` (6 digits),
  `address.country` (must stay `"IN"`), `address.latitude` /
  `address.longitude`: only change these if the business physically moves.
- `instagram`: full URL, e.g. `"https://instagram.com/theovenvibe"`.
- `google_business_url`: the Google Business Profile share link.

## 6. Announcement banner (bonus — same file, different section)

`site.config.json` also has an `"announcement"` object, shown as a banner
on every page:
```json
"announcement": {
  "text": ""
}
```
Set `text` to any sentence (e.g. `"Closed today for Holi"`) to show a
banner site-wide. Set it back to `""` (empty string) to hide it. No emoji
— the site is emoji-free by owner decision (AGENTS.md golden rule #7).

## 7. Verify

```bash
npm run build
```
Expect: `Result (N files): 0 errors`.

Validation rules that will fail the build if wrong:
- `phone` must match `+91` + 10 digits exactly.
- `whatsapp` must match `91` + 10 digits, no `+`.
- `email` must be a valid email shape.
- `hours.open` / `hours.close` must be `HH:MM` 24-hour format.
- `address.postal_code` must be exactly 6 digits.
- `instagram` / `google_business_url` must be valid URLs (start with
  `https://`).

Example error:
```
Invalid data — fix these fields and rebuild:
  • site.config.json → business.phone: phone must look like '+919692261138' (+91 then 10 digits, no spaces)
```
Still stuck → `skills/troubleshoot-build.md`.

## 8. Commit and ship

```bash
git status --short
git fetch origin develop --quiet
git checkout -b feature/update-hours origin/develop
# ... edit site.config.json ...
npm run build
git add site.config.json PROGRESS.md
git commit -m "fix(config): extend closing time to 10 PM"
git push -u origin feature/update-hours
```
Then merge per `skills/release-manager.md` §5.

## 9. Editing from a phone (GitHub web editor)

1. Go to `https://github.com/theovenvibe/theovenvibe.github.io`.
2. Open `site.config.json`, tap the pencil icon.
3. Edit the field(s) in `business` (remember step 3's open/close/display
   pairing, and step 4's phone/phone_display/whatsapp trio).
4. Scroll down → "Commit changes" → **"Create a new branch for this
   commit and start a pull request"** → **Propose changes** → **Create
   pull request**.
5. Check the "Checks" tab after ~1–2 minutes: green = safe to merge.
