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

const code = z.union([z.string(), z.number().int()]).transform(String).pipe(z.string().regex(/^[A-Za-z0-9_-]{1,80}$/, 'safe catalogue code required'));
const metadata = {
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  serving: z.object({ amount: z.number().int().positive(), unit: z.string().trim().min(1).max(40) }).optional(),
};

export const menuItemSchema = z.object({
  product_code: code,
  item_id: z.number().int().positive(),
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
  ...metadata,
}).passthrough();

export const comboSchema = z.object({
  combo_code: code,
  combo_name: z.string().min(1),
  combo_price: price,
  description: z.string().min(1),
  items_included: z.array(code).min(1),
  item_quantities: z.record(z.string(), z.number().int().positive()).optional(),
  image_code: code,
  status,
  ...metadata,
}).passthrough();

export const addonSchema = z.object({
  addon_code: code,
  addon_name: z.string().min(1),
  addon_price: price,
  image_code: code,
  status,
  ...metadata,
}).passthrough();

export const menuSchema = z
  .object({
    _comment: z.string().optional(),
    Menu_Items: z.array(menuItemSchema).min(1),
    Combos: z.array(comboSchema),
    Add_ons: z.array(addonSchema),
    Addon_Mappings: z.object({
      categories: z.record(z.string(), z.array(code)).optional(),
      items: z.record(z.string(), z.array(code)).optional(),
    }).optional(),
  })
  .passthrough()
  .superRefine((menu, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({code:'custom',path,message});
    for (const [key,rows,field] of [['Menu_Items',menu.Menu_Items,'product_code'],['Combos',menu.Combos,'combo_code'],['Add_ons',menu.Add_ons,'addon_code']] as const) {
      const seen = new Set();
      rows.forEach((row,index)=>{
        const value = row[field];
        if (seen.has(value)) issue([key,index,field],'Duplicate catalogue code');
        seen.add(value);
        if ('veg' in row && row.veg === false) issue([key,index,'veg'],'Kitchen is pure vegetarian');
        const name = 'item_name' in row ? row.item_name : 'combo_name' in row ? row.combo_name : row.addon_name;
        if (/\b(chicken|egg|mutton|fish|prawn|keema)\b/i.test(`${name} ${row.description ?? ''}`.replace(/\b(no|without) egg\b/gi,''))) issue([key,index],'Kitchen is pure vegetarian');
      });
    }
    const ids = new Set();
    menu.Menu_Items.forEach((row,i)=>{if(ids.has(row.item_id))issue(['Menu_Items',i,'item_id'],'Duplicate item_id');ids.add(row.item_id);});
    // Every combo must reference product codes that actually exist.
    const codes = new Set(menu.Menu_Items.map((i) => i.product_code));
    menu.Combos.forEach((combo, i) => {
      for (const ref of combo.items_included) {
        if (!codes.has(ref)) {
          ctx.addIssue({
            code: 'custom',
            path: ['Combos', i, 'items_included'],
            message: `Combo "${combo.combo_name}" references product_code ${ref}, which does not exist in Menu_Items`,
          });
        }
        else if (combo.status === 'available' && menu.Menu_Items.find(item=>item.product_code===ref)?.status !== 'available') issue(['Combos',i,'items_included'],'Unlist the combo before unlisting its component');
      }
      for (const ref of Object.keys(combo.item_quantities ?? {})) if (!combo.items_included.includes(ref)) issue(['Combos',i,'item_quantities',ref],'Quantity must reference an included item');
    });
    const addonCodes = new Set(menu.Add_ons.map(a=>a.addon_code));
    const categories = new Set(menu.Menu_Items.map(i=>i.category));
    for (const kind of ['items','categories'] as const) for (const [target,refs] of Object.entries(menu.Addon_Mappings?.[kind] ?? {})) {
      const path = ['Addon_Mappings',kind,target];
      if (!(kind === 'items' ? codes : categories).has(target)) issue(path,'Unknown mapping target');
      if (new Set(refs).size !== refs.length || refs.some(ref=>!addonCodes.has(ref))) issue(path,'Mapping requires unique existing add-on codes');
    }
  });

export type Menu = z.infer<typeof menuSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type Combo = z.infer<typeof comboSchema>;
export type Addon = z.infer<typeof addonSchema>;
