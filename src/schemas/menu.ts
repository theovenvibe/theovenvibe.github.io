/**
 * Zod schema for /menu.json — the single source of truth for the menu
 * (PRD §6). Field names mirror the Zomato catalogue export and MUST NOT
 * be renamed. A malformed edit fails `astro check`/`astro build` with a
 * readable error; the live site keeps serving the last good deploy.
 */
import { z } from 'astro/zod';

const price = z
  .number({ message: 'price must be a number (no quotes, no ₹ symbol)' })
  .int('price must be a whole number of rupees')
  .positive('price must be greater than 0');

const status = z.enum(['available', 'unavailable'], {
  message: "status must be exactly 'available' or 'unavailable'",
});

const code = z.union([z.string(), z.number()]).transform(String);

export const menuItemSchema = z.object({
  product_code: code,
  item_id: z.number(),
  category: z.string().min(1, 'category is required — it groups items on the menu page'),
  subcategory: z.string().optional(),
  item_name: z.string().min(1),
  display_name: z.string().min(1),
  price,
  description: z.string().min(1),
  status,
  /** Optional override; when absent, veg is derived from the description marker. */
  veg: z.boolean().optional(),
  /** Optional override; defaults to product_code. */
  image_code: code.optional(),
});

export const comboSchema = z.object({
  combo_code: code,
  combo_name: z.string().min(1),
  combo_price: price,
  description: z.string().min(1),
  items_included: z.array(code).min(1),
  image_code: code,
  status,
});

export const addonSchema = z.object({
  addon_code: code,
  addon_name: z.string().min(1),
  addon_price: price,
  image_code: code,
  status,
});

export const menuSchema = z
  .object({
    _comment: z.string().optional(),
    Menu_Items: z.array(menuItemSchema).min(1),
    Combos: z.array(comboSchema),
    Add_ons: z.array(addonSchema),
  })
  .superRefine((menu, ctx) => {
    // Every combo must reference product codes that actually exist.
    const codes = new Set(menu.Menu_Items.map((i) => i.product_code));
    menu.Combos.forEach((combo, i) => {
      for (const ref of combo.items_included) {
        if (!codes.has(ref)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['Combos', i, 'items_included'],
            message: `Combo "${combo.combo_name}" references product_code ${ref}, which does not exist in Menu_Items`,
          });
        }
      }
    });
  });

export type Menu = z.infer<typeof menuSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type Combo = z.infer<typeof comboSchema>;
export type Addon = z.infer<typeof addonSchema>;
