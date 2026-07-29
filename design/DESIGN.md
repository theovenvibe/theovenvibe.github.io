# DESIGN.md — The Oven Vibe v2 design system (Phase 2b)

Status: **draft — awaiting Milan's A/B pick.** After the pick, the winning
tokens get locked into `src/styles/global.css` and this file records the
final decision. Research basis: `design/RESEARCH.md` (Phase 2a).

## Mockups

| File | Direction | Paired logo |
|---|---|---|
| `design/mockups/ember-editorial.html` | **A — Ember Editorial**: deep warm-charcoal canvas, hairline ember borders, one glass surface (sticky bar only) | Ember Arch |
| `design/mockups/fresh-counter.html` | **B — Fresh Counter**: warm oat/cream canvas, sharp bordered cards, zero blur | Flame Mark |

Open both in a browser (mobile width AND full desktop) — they use the real
photos and real menu prices. Logos are swappable across directions; the
A/B axis is canvas + card treatment.

## Tokens (draft)

### Direction A — Ember Editorial (dark)

| Token | Value | AA check |
|---|---|---|
| `--bg` | `#191411` deep warm charcoal | — |
| `--surface` | `#221B16` card | — |
| `--text` | `#F5EDE3` warm cream | 15.75:1 on bg ✅ |
| `--text-2` | `#C7B9AB` secondary | 8.86:1 on surface ✅ |
| `--brand` | `#E85C41` rust red (lifted for dark) | 5.25:1 on bg ✅ (text-safe) |
| `--brand-deep` | `#C2492F` CTA fill | cream text 4.58:1 ✅ |
| `--amber` | `#F5A83C` prices, ember glow, focus ring | 8.53:1 on surface ✅ |
| `--border` | `#9C583B` hairline (decorative only) | focus/hover states use `--amber` (≥3:1) |

### Direction B — Fresh Counter (warm light)

| Token | Value | AA check |
|---|---|---|
| `--bg` | `#F6EFE3` oat | — |
| `--surface` | `#FFFDF8` card | — |
| `--text` | `#2A211A` warm ink | 13.81:1 ✅ |
| `--text-2` | `#6B5D4F` secondary | 6.25:1 on surface ✅ |
| `--brand` | `#A93B22` rust red (deepened for light) | 5.51:1 on bg ✅ |
| `--brand-deep` | `#B14028` CTA fill | light text 5.41:1 ✅ |
| `--amber-ink` | `#8F5A14` small amber accents | 5.67:1 ✅ |
| `--border` | `#E3D5C6` card border | decorative; focus = `--brand` |

### Shared

- **Fonts:** `Bricolage Grotesque` (display/wordmark, wght 800) +
  `Instrument Sans` (body/UI, wght 400/600). Self-hosted woff2 in Phase 3
  (mockups use CDN for preview only). Max 3 font files total.
- **Type scale (mobile-first):** 14 / 16 / 18 / 22 / 28 / 36 / 48–56 (hero).
  Prices always 600 weight, amber (A) / brand red (B).
- **Space scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72.
- **Radius:** cards 16, buttons/pills 999, images 12, oven-arch frames
  `radius 50% 50% 0 0 / 32% 32% 0 0` (signature shape, echoes the logo arch).
- **Photo treatment (fixes crop inconsistency, PRD §8):** every card image
  in a fixed `aspect-ratio: 4/3` (bestseller tiles 1/1) + `object-fit: cover`;
  floating-subject shots (burger, sandwich) get `.zoom` (`scale(1.22)`).
  Uniform grade: `filter: saturate(1.06) contrast(1.03)`; card background
  is near-black so photo edges dissolve (A) / photos sit in dark inset
  frames so black never touches cream directly (B).

## Motion spec (Phase 3 implements with Motion + Lenis)

| What | Spec |
|---|---|
| Scroll reveal (cards, sections) | fade + 12px rise, 280ms ease-out, once, stagger 60ms within a grid |
| Card hover (desktop) | lift 4px + image scale 1.04, 200ms |
| Cart bar appear / count change | 320ms spring (stiffness ~300, damping ~24) |
| Free-delivery progress | width transition 400ms ease-out |
| Hero | NO parallax beyond 8px drift; nothing may delay LCP |
| Reduced motion | `prefers-reduced-motion: reduce` kills everything, no exceptions |
| Blur budget | Direction A: exactly ONE `backdrop-filter` surface (sticky bar). Direction B: zero. |

## Logos & favicon

- `design/logos/ember-arch-mark.svg` + `ember-arch-lockup.svg` — oven-door
  arch as the O of OVEN, amber ember dot. Mark is pure paths (favicon-safe).
- `design/logos/flame-mark.svg` + `flame-lockup.svg` — teardrop flame with
  inner notch on rust tile; cleanest at 16px.
- Both mockups render their mark at 16/32/48px in the "Brand" section —
  judge crispness there. Favicon set generated after the pick:
  `favicon.svg`, `apple-touch-icon.png` (180), OG default (1200×630).
- Wordmark text in lockups uses Bricolage Grotesque; final production SVGs
  get text converted to paths in Phase 3 (no font dependency).

## Created-imagery style (blog/OG/illustrations — PRD §8)

Flat duotone SVG illustrations using the direction's surface + brand red +
amber only; engraved-linework flourishes allowed sparingly; **never**
AI-generated fake food photos — food pixels come only from the real
catalogue (binding).
