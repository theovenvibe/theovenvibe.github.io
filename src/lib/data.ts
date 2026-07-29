/**
 * Build-time data access for menu.json and site.config.json (PRD §6).
 * Import from here — never read the JSON files directly in pages.
 * Validation errors are rewritten to say exactly which field to fix.
 */
import { readFileSync, existsSync } from 'node:fs';
import { z } from 'astro/zod';
import { menuSchema, type Menu, type MenuItem, type Combo, type Addon } from '../schemas/menu';
import { siteConfigSchema, type SiteConfig } from '../schemas/site-config';

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

/** Strip catalogue markers like "[Veg preparation]" for display copy. */
export function displayDescription(item: { description: string }): string {
  return item.description.replace(/\[[^\]]*\]\s*/g, '').trim();
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
