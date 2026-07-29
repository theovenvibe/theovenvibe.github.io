/**
 * Zod schema for /site.config.json — every business value a non-tech
 * person may change (PRD §6): delivery charges, hours, phone, rating,
 * announcement banner. Pages read ONLY from here; nothing is hard-coded.
 */
import { z } from 'astro/zod';

const comment = z.string().optional();

export const siteConfigSchema = z.object({
  _comment: comment,
  business: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    phone: z
      .string()
      .regex(/^\+91\d{10}$/, "phone must look like '+919692261138' (+91 then 10 digits, no spaces)"),
    phone_display: z.string().min(1),
    whatsapp: z
      .string()
      .regex(/^91\d{10}$/, "whatsapp must look like '919692261138' (91 then 10 digits — no '+', no spaces)"),
    email: z.string().email(),
    address: z.object({
      locality: z.string(),
      region: z.string(),
      postal_code: z.string().regex(/^\d{6}$/, 'postal_code must be a 6-digit PIN'),
      country: z.literal('IN'),
      latitude: z.number(),
      longitude: z.number(),
    }),
    hours: z.object({
      open: z.string().regex(/^\d{2}:\d{2}$/, "open must be 24h 'HH:MM', e.g. '11:00'"),
      close: z.string().regex(/^\d{2}:\d{2}$/, "close must be 24h 'HH:MM', e.g. '21:00'"),
      days: z.string(),
      display: z.string(),
    }),
    instagram: z.string().url(),
    google_business_url: z.string().url(),
  }),
  rating: z.object({
    _comment: comment,
    value: z
      .number()
      .min(1, 'rating.value must be between 1 and 5')
      .max(5, 'rating.value must be between 1 and 5'),
    count: z.number().int().positive(),
    as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "as_of must be 'YYYY-MM-DD'"),
  }),
  delivery: z.object({
    hook: z.string().min(1),
    slabs: z
      .array(
        z.object({
          label: z.string().min(1),
          charge: z.number().int().nonnegative('slab charge must be 0 or more rupees'),
        }),
      )
      .min(1),
    free_above: z.number().int().positive('free_above must be a positive rupee amount'),
    free_above_note: z.string().min(1),
    radius_note: z.string().min(1),
  }),
  hero_dish_code: z.union([z.string(), z.number()]).transform(String),
  announcement: z.object({
    _comment: comment,
    text: z.string(),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
