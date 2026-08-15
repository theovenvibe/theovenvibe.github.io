/**
 * Build-time data access for menu.json and site.config.json (PRD §6).
 * Import from here — never read the JSON files directly in pages.
 * Validation errors are rewritten to say exactly which field to fix.
 */
import { readFileSync, existsSync } from 'node:fs';
import { z } from 'astro/zod';
import { menuSchema, type Menu, type MenuItem, type Combo, type Addon } from '../schemas/menu';
import { siteConfigSchema, type SiteConfig } from '../schemas/site-config';
import { formatTime, formatTimeRange } from './pricing';

function loadJson<T>(file: string, schema: z.ZodType<T>): T {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf-8'));
  } catch (e) {
    throw new Error(
      `${file} is not valid JSON — usually a missing comma or quote near the last edit. (${(e as Error).message})`,
    );
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues
      .map((i) => `  • ${file} → ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid data — fix these fields and rebuild:\n${lines}`);
  }
  return result.data;
}

export const menu: Menu = loadJson('menu.json', menuSchema);
export const site: SiteConfig = loadJson('site.config.json', siteConfigSchema);

/* ---------- derived helpers ---------- */

const NON_VEG = /\b(chicken|egg|mutton|fish|prawn|keema)\b/i;

/** Veg flag: explicit `veg` field wins; otherwise derived (PRD §6). */
export function isVeg(item: MenuItem): boolean {
  if (typeof item.veg === 'boolean') return item.veg;
  if (/\[veg preparation\]/i.test(item.description)) return true;
  return !NON_VEG.test(`${item.item_name} ${item.description}`);
}

/* ---------- display copy (Phase 4) ----------
 * menu.json is the Zomato mirror and stays byte-for-byte untouched (PRD §6).
 * Everything the visitor reads is cleaned here, at render time:
 *   - emoji / pictographs are stripped (premium copy pass, owner 2026-07-30)
 *   - catalogue markers ("[Regular, 7 inches]", "[Veg preparation]") leave the
 *     name/description, but the ones that carry real buying information (size,
 *     spice level) come back as a muted meta line via `displayMeta()`
 * The site is 100% pure veg (PRD §3), so "[Veg preparation]" is dropped from
 * every item — it's stated once, prominently, instead of 32 times.
 */

const EMOJI = /[\p{Extended_Pictographic}\u{200D}\u{FE0F}\u{20E3}]/gu;
const CHILLI = /\u{1F336}/gu;
const VEG_MARKER = /veg\s*preparation/i;

const tidy = (s: string) => s.replace(/\s{2,}/g, ' ').replace(/\s+([,.])/g, '$1').trim();

/** Name as shown on a card: no emoji, no `[bracket]` catalogue markers. */
export function displayName(raw: string): string {
  return tidy(raw.replace(/\[[^\]]*\]/g, '').replace(EMOJI, ''));
}

/**
 * The buying information that was hiding inside the markers, as short muted
 * chips: size ("Regular · 7 inches", "25 g") and spice level.
 */
export function displayMeta(raw: string): string[] {
  const meta: string[] = [];
  for (const [, inner] of raw.matchAll(/\[([^\]]*)\]/g)) {
    if (VEG_MARKER.test(inner)) continue;
    const size = inner
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .join(' · ');
    if (size) meta.push(size);
  }
  const chillies = (raw.match(CHILLI) ?? []).length;
  if (chillies === 1) meta.push('Spicy');
  else if (chillies > 1) meta.push('Extra spicy');
  return meta;
}

/** Strip catalogue markers like "[Veg preparation]" for display copy. */
export function displayDescription(item: { description: string }): string {
  return tidy(item.description.replace(/\[[^\]]*\]/g, '').replace(EMOJI, ''));
}

export const availableItems = menu.Menu_Items.filter((i) => i.status === 'available');
export const availableCombos = menu.Combos.filter((c) => c.status === 'available');
export const availableAddons = menu.Add_ons.filter((a) => a.status === 'available');

/** Categories in menu.json order, each with its available items. */
export const categories: { name: string; items: MenuItem[] }[] = (() => {
  const map = new Map<string, MenuItem[]>();
  for (const item of availableItems) {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
  }
  return [...map.entries()].map(([name, items]) => ({ name, items }));
})();

export const heroDish: MenuItem =
  availableItems.find((i) => i.product_code === site.hero_dish_code) ??
  (() => {
    throw new Error(
      `site.config.json → hero_dish_code ${site.hero_dish_code} matches no available item in menu.json`,
    );
  })();

/* ---------- the orderable catalogue ---------- */

/**
 * One thing a customer can put in an order: a menu item, a combo, or an add-on,
 * flattened into the shape the order form actually needs.
 *
 * `id` is what the cart stores in localStorage, so it must stay stable — it is
 * built from the catalogue codes, which MEMORY.md already pins as the join keys
 * to Zomato. Renaming a dish does not orphan a cart; changing its code does.
 */
export interface OrderableRow {
  id: string;
  name: string;
  price: number;
  /** Still cooked during the late-night window? The boiling stations are not. */
  lateNight: boolean;
  /** The heading this belongs under — a category name, "Combos" or "Add-ons". */
  group: string;
}

const lateNightOffCategories = new Set(site.delivery.late_night.unavailable_categories);
const lateNightOffItems = new Set(site.delivery.late_night.unavailable_items);

/** Only the boiling stations shut after closing — everything else stays on. */
function servedLateNight(category: string, itemName: string): boolean {
  return !lateNightOffCategories.has(category) && !lateNightOffItems.has(itemName);
}

/**
 * Every orderable thing, in menu order. Built here rather than in a page so the
 * price calculator, the checkout page and the add-to-cart buttons cannot end up
 * with three different ideas of what is on the menu at 1am.
 */
export const orderCatalog: OrderableRow[] = [
  ...categories.flatMap(({ name, items }) =>
    items.map((i) => ({
      id: `item-${i.product_code}`,
      name: displayName(i.display_name || i.item_name),
      price: i.price,
      lateNight: servedLateNight(name, i.item_name),
      group: name,
    })),
  ),
  ...availableCombos.map((c) => ({
    id: `combo-${c.combo_code}`,
    name: displayName(c.combo_name),
    price: c.combo_price,
    lateNight: !lateNightOffItems.has(c.combo_name),
    group: 'Combos',
  })),
  ...availableAddons.map((a) => ({
    id: `addon-${a.addon_code}`,
    name: displayName(a.addon_name),
    price: a.addon_price,
    lateNight: !lateNightOffItems.has(a.addon_name),
    group: 'Add-ons',
  })),
];

/** The same catalogue grouped for rendering, preserving menu order. */
export const orderCatalogGroups: { name: string; rows: OrderableRow[] }[] = (() => {
  const map = new Map<string, OrderableRow[]>();
  for (const row of orderCatalog) {
    if (!map.has(row.group)) map.set(row.group, []);
    map.get(row.group)!.push(row);
  }
  return [...map.entries()].map(([name, rows]) => ({ name, rows }));
})();

/** Cart id for anything in the catalogue — the one place these strings are built. */
export const itemCartId = (productCode: string) => `item-${productCode}`;
export const comboCartId = (comboCode: string) => `combo-${comboCode}`;
export const addonCartId = (addonCode: string) => `addon-${addonCode}`;

/* ---------- delivery copy (spec: FAQ, banner and calculator all read
   site.delivery — these helpers exist so that no page hand-formats a rupee
   or a time range on its own) ---------- */

/** "₹29 for 0–2 km · ₹69 for 2–4 km" */
export const deliverySlabLine = site.delivery.slabs.map((s) => `₹${s.charge} for ${s.label}`).join(' · ');

/** "FREE above ₹499 within 2 km" for a given slab. */
export function slabFreeAboveLine(slab: SiteConfig['delivery']['slabs'][number]): string {
  return `FREE above ₹${slab.free_above} within ${slab.km_to} km`;
}

/** Free-delivery line for the first (cheapest) slab — matches the banner's target wording. */
export const deliveryFreeAboveLine = slabFreeAboveLine(site.delivery.slabs[0]);

/** All slabs' free-delivery thresholds, e.g. for pages that list every slab. */
export const deliveryFreeAboveLineAll = site.delivery.slabs.map(slabFreeAboveLine).join(' · ');

/**
 * "FREE delivery above ₹499, within 2 km" — banner phrasing for the first
 * (cheapest) slab. Every price claim carries its condition (owner rule,
 * 2026-08-14): this line is meaningless without the "within X km" part.
 */
export const deliveryFreeAboveBannerLine = `FREE delivery above ₹${site.delivery.slabs[0].free_above}, within ${site.delivery.slabs[0].km_to} km`;

/**
 * "Minimum order ₹249 (₹399 beyond 2 km)" — assumes exactly two slabs, which
 * is the current shape of site.delivery.slabs; if a third slab is ever
 * added this line needs a rewrite, not just new numbers.
 */
export const deliveryMinimumLine =
  site.delivery.slabs.length >= 2
    ? `Minimum order ₹${site.delivery.slabs[0].min_order} (₹${site.delivery.slabs[1].min_order} beyond ${site.delivery.slabs[0].km_to} km)`
    : `Minimum order ₹${site.delivery.slabs[0].min_order}`;

/** "Afternoons 12–4pm, Mon–Fri: ₹19 delivery, minimum order ₹199" — the ₹19 claim never appears without its unlocking minimum. */
export const quietHoursLine = `Afternoons ${formatTimeRange(site.delivery.quiet_hours.from, site.delivery.quiet_hours.to)}, ${site.delivery.quiet_hours.days}: ₹${site.delivery.quiet_hours.charge} delivery, minimum order ₹${site.delivery.slabs[0].min_order_quiet}`;

/** "Late night (11:30pm–1am): +₹79, ₹399 minimum, paid online in advance." */
export const lateNightLine = `Late night (${formatTimeRange(site.delivery.late_night.from, site.delivery.late_night.to)}): +₹${site.delivery.late_night.kitchen_charge} kitchen charge on every order, +₹${site.delivery.late_night.delivery_premium} more if we deliver, ₹${site.delivery.late_night.min_order} minimum, paid online in advance. Collecting it yourself saves the ₹${site.delivery.late_night.delivery_premium} — the usual pickup discount does not apply after closing`;

/**
 * Banner disclosure lines (owner rule, 2026-08-14): a surcharge is never
 * advertised without a way to see the real number before ordering — both
 * of these are always paired with the calculator link wherever they render.
 * "Late night after 11:30pm: +₹79, minimum ₹399, prepaid"
 */
export const lateNightBannerLine = `Late night after ${formatTime(site.delivery.late_night.from)}: +₹${site.delivery.late_night.kitchen_charge} kitchen, +₹${site.delivery.late_night.delivery_premium} to deliver, minimum ₹${site.delivery.late_night.min_order}, prepaid`;

/**
 * Rain is a standing POLICY disclosure — it stays on the banner regardless
 * of delivery.rain.active, worded conditionally so it never surprises
 * anyone the day it turns on. Only the calculator and the live charge
 * itself read `rain.active`.
 * "Rain: +₹29 while it lasts"
 */
export const rainBannerLine = `Rain: +₹${site.delivery.rain.surcharge} while it lasts`;

/** Compact single-line fallback for narrow banners: discloses the surcharges exist without the numbers, always paired with the calculator link. */
export const surchargesCompactLine = 'Late-night and rain orders cost extra';

/** Furthest distance served directly (the last slab's km_to) — beyond this, Zomato/Swiggy. */
export const maxDeliveryKm = site.delivery.slabs[site.delivery.slabs.length - 1].km_to;

export const quietHoursTimeRange = formatTimeRange(site.delivery.quiet_hours.from, site.delivery.quiet_hours.to);
export const lateNightTimeRange = formatTimeRange(site.delivery.late_night.from, site.delivery.late_night.to);

/* ---------- images ---------- */

const IMAGE_DIRS = ['product_images', 'combo_images', 'add_on_images', 'brand_images'];
const PLACEHOLDER = '/static/images/brand_images/The%20Oven%20vibe_logo.webp';

export interface MenuImage {
  avif: string | null;
  webp: string;
}

/**
 * Resolve an image_code to site-absolute AVIF/WebP URLs.
 * Missing image → build-time warning + brand placeholder (PRD §6: warn, don't fail).
 */
export function imageFor(entry: MenuItem | Combo | Addon): MenuImage {
  const code =
    'image_code' in entry && entry.image_code
      ? entry.image_code
      : (entry as MenuItem).product_code;
  for (const dir of IMAGE_DIRS) {
    const base = `static/images/${dir}/${code}`; // URL path (unchanged from v1)
    const disk = `public/${base}`; // on disk, assets live under public/
    if (existsSync(`${disk}.webp`)) {
      return {
        avif: existsSync(`${disk}.avif`) ? `/${base}.avif` : null,
        webp: `/${base}.webp`,
      };
    }
  }
  console.warn(`[menu] no image found for code ${code} — using brand placeholder`);
  return { avif: null, webp: PLACEHOLDER };
}
