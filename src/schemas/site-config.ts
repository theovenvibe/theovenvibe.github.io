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
      _comment: comment,
      /**
       * Street line as published on the Google Business Profile. Optional, but
       * when present it MUST match GBP word-for-word — Google cross-checks the
       * site's address against the profile (NAP consistency, PRD §9).
       */
      street: z.string().optional(),
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
          km_from: z.number().nonnegative('km_from must be 0 or more'),
          km_to: z.number().positive('km_to must be a positive number of km'),
          charge: z.number().int().nonnegative('slab charge must be 0 or more rupees'),
          min_order: z.number().int().positive('min_order must be a positive rupee amount'),
          min_order_quiet: z
            .number()
            .int()
            .positive('min_order_quiet must be a positive rupee amount'),
          free_above: z.number().int().positive('free_above must be a positive rupee amount'),
        }),
      )
      .min(1, 'delivery.slabs must list at least one slab'),
    beyond_note: z.string().min(1),
    quiet_hours: z.object({
      from: z.string().regex(/^\d{2}:\d{2}$/, "quiet_hours.from must be 24h 'HH:MM', e.g. '12:00'"),
      to: z.string().regex(/^\d{2}:\d{2}$/, "quiet_hours.to must be 24h 'HH:MM', e.g. '16:00'"),
      days: z.string().min(1),
      charge: z.number().int().nonnegative('quiet_hours.charge must be 0 or more rupees'),
      applies_to_slab: z.string().min(1),
      note: z.string().min(1),
    }),
    late_night: z.object({
      from: z.string().regex(/^\d{2}:\d{2}$/, "late_night.from must be 24h 'HH:MM', e.g. '23:30'"),
      to: z.string().regex(/^\d{2}:\d{2}$/, "late_night.to must be 24h 'HH:MM', e.g. '01:00'"),
      kitchen_charge: z
        .number()
        .int()
        .nonnegative('late_night.kitchen_charge must be 0 or more rupees — it covers reopening the kitchen'),
      delivery_premium: z
        .number()
        .int()
        .nonnegative('late_night.delivery_premium must be 0 or more rupees — the extra cost of riding out late'),
      _charge_comment: z.string().optional(),
      min_order: z.number().int().positive('late_night.min_order must be a positive rupee amount'),
      prepaid: z.boolean(),
      note: z.string().min(1),
      /* What the kitchen STOPS cooking after closing. Everything not named
         here stays available during the late-night window. */
      unavailable_categories: z
        .array(z.string().min(1))
        .default([])
        .describe('Menu categories the kitchen stops cooking after closing'),
      unavailable_items: z.array(z.string().min(1)).default([]),
      menu_note: z.string().min(1, 'late_night.menu_note is shown to customers — say what is off the menu'),
      _availability_comment: z.string().optional(),
    }),
    rain: z.object({
      active: z.boolean(),
      surcharge: z.number().int().nonnegative('rain.surcharge must be 0 or more rupees'),
      note: z.string().min(1),
      waived_when_prepaid: z.boolean(),
      prepaid_note: z.string().min(1),
      later_note: z.string().min(1),
      now_window_minutes: z
        .number()
        .int()
        .positive('rain.now_window_minutes must be a whole number of minutes'),
      _comment: z.string().optional(),
    }),
    pickup_discount: z.number().int().nonnegative('pickup_discount must be 0 or more rupees'),
    pickup_min_order: z
      .number()
      .int()
      .nonnegative('pickup_min_order must be a rupee amount — the basket size the pickup discount needs'),
    _pickup_comment: z.string().optional(),
    campus_batch: z.object({
      charge: z.number().int().nonnegative('campus_batch.charge must be 0 or more rupees'),
      window_minutes: z
        .number()
        .int()
        .positive('campus_batch.window_minutes must be a whole number of minutes'),
      min_orders: z.number().int().min(2, 'campus_batch.min_orders must be 2 or more'),
      areas: z.array(z.string().min(1)).min(1, 'campus_batch.areas must list at least one area'),
      note: z.string().min(1),
    }),
    bulk: z.object({
      min_pizzas: z.number().int().positive('bulk.min_pizzas must be a positive whole number'),
      discount_pct: z
        .number()
        .int()
        .min(1, 'bulk.discount_pct must be between 1 and 100')
        .max(100, 'bulk.discount_pct must be between 1 and 100'),
      notice_minutes: z
        .number()
        .int()
        .positive('bulk.notice_minutes must be a whole number of minutes'),
      prepaid: z.boolean(),
    }),
    max_delivery_charge: z
      .number()
      .int()
      .positive('max_delivery_charge must be a positive rupee amount'),
    regulars: z.object({
      min_orders: z.number().int().positive('regulars.min_orders must be a positive whole number'),
      free_above: z.number().int().positive('regulars.free_above must be a positive rupee amount'),
      note: z.string().min(1),
    }),
    cod_cap: z.number().int().positive('cod_cap must be a positive rupee amount'),
    radius_note: z.string().min(1),
  }),
  hero_dish_code: z.union([z.string(), z.number()]).transform(String),
  announcement: z.object({
    _comment: comment,
    text: z.string(),
  }),
  analytics: z.object({
    _comment: comment,
    /** Umami website ID (cloud.umami.is → Settings → Websites). Empty = analytics off. */
    umami_website_id: z
      .string()
      .regex(/^$|^[a-zA-Z0-9-]+$/, "umami_website_id must be empty \"\" or the ID copied from cloud.umami.is (letters, numbers, hyphens only)"),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
