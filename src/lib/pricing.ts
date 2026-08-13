/**
 * Delivery-price calculation engine (docs/DELIVERY_PRICING.md, spec §1).
 * Pure functions, no DOM, no fetch — importable both at build time (to
 * render the no-JS slab table in price-calculator.astro) and from that
 * page's client-side <script> (bundled by Vite, no runtime network call).
 *
 * The calculation order below is the contract shared with faq.astro's copy
 * (spec §1, steps 1-9):
 *   1. Food subtotal from menu.json prices.
 *   2. Pick the slab by distance; beyond the last slab -> Zomato/Swiggy.
 *   3. Minimum order: min_order_quiet when in quiet hours AND the slab
 *      allows it (both slabs do), else min_order. Below it: no total.
 *   4. Base fee: quiet hours replace the slab charge with quiet_hours.charge
 *      ONLY for the slab named in quiet_hours.applies_to_slab.
 *   5. Free delivery at/above the slab's free_above (regulars use
 *      regulars.free_above instead).
 *   6. Add surcharges: late night, rain (only when rain.active).
 *   7. Subtract pickup / pre-order discounts.
 *   8. Cap the SUM of delivery charges (fee + surcharges) at
 *      max_delivery_charge — the banner's promise covers surcharges too.
 *   9. Regulars: surcharges waived entirely (shown as a $0 waived line, not
 *      dropped, so the breakdown still explains itself).
 */
import type { SiteConfig } from '../schemas/site-config';

export type DeliveryConfig = SiteConfig['delivery'];
export type Slab = DeliveryConfig['slabs'][number];

/* ---------- time helpers ---------- */

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Inclusive range check that handles ranges wrapping past midnight (e.g. 23:30-01:00). */
export function isTimeInRange(time: string, from: string, to: string): boolean {
  const t = toMinutes(time);
  const f = toMinutes(from);
  const u = toMinutes(to);
  if (f <= u) return t >= f && t <= u;
  return t >= f || t <= u;
}

const DAY_TOKENS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Parses a "Mon–Fri" / "Mon-Fri" style range into the set of weekday indices (0=Sun). */
export function parseDayRange(days: string): Set<number> {
  const parts = days.split(/[–-]/).map((s) => s.trim());
  const start = DAY_TOKENS[parts[0]];
  const end = DAY_TOKENS[parts[1]];
  if (parts.length === 2 && start !== undefined && end !== undefined) {
    const set = new Set<number>();
    let d = start;
    for (;;) {
      set.add(d);
      if (d === end) break;
      d = (d + 1) % 7;
    }
    return set;
  }
  // Unparseable -> fail open (every day) rather than silently blocking orders.
  return new Set([0, 1, 2, 3, 4, 5, 6]);
}

function fmtHourMin(hhmm: string): { num: number; min: number; suffix: 'am' | 'pm' } {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix: 'am' | 'pm' = h === 0 || h < 12 ? 'am' : 'pm';
  let num = h % 12;
  if (num === 0) num = 12;
  return { num, min: m, suffix };
}

function fmtHourPart(v: { num: number; min: number; suffix: 'am' | 'pm' }, drop: boolean): string {
  return `${v.num}${v.min ? `:${String(v.min).padStart(2, '0')}` : ''}${drop ? '' : v.suffix}`;
}

/** "23:30" -> "11:30pm" */
export function formatTime(hhmm: string): string {
  return fmtHourPart(fmtHourMin(hhmm), false);
}

/** "12:00","16:00" -> "12–4pm"; "23:30","01:00" -> "11:30pm–1am". */
export function formatTimeRange(from: string, to: string): string {
  const a = fmtHourMin(from);
  const b = fmtHourMin(to);
  const dropFirstSuffix = a.suffix === b.suffix;
  return `${fmtHourPart(a, dropFirstSuffix)}–${fmtHourPart(b, false)}`;
}

/* ---------- slab lookup ---------- */

/** Slabs are contiguous from 0; a distance lands in the first slab whose km_to it does not exceed. */
export function slabForDistance(cfg: DeliveryConfig, km: number): Slab | null {
  return cfg.slabs.find((s) => km <= s.km_to) ?? null;
}

export function maxServedKm(cfg: DeliveryConfig): number {
  return cfg.slabs[cfg.slabs.length - 1].km_to;
}

/* ---------- quote ---------- */

export interface QuoteInput {
  subtotal: number;
  /** km as a plain number, or null when the visitor picked "More than 4 km" with no override. */
  km: number | null;
  time: string; // "HH:MM", 24h
  dayOfWeek: number; // 0=Sun..6=Sat
  orderType: 'delivery' | 'pickup';
  preorder: boolean;
  regular: boolean;
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export type TimeRule = 'quiet' | 'late_night' | 'standard';

export interface QuoteBeyond {
  kind: 'beyond';
  note: string;
}

export interface QuoteBelowMinimum {
  kind: 'below_minimum';
  minimum: number;
  short: number;
  quietAlt?: { minimum: number; window: string };
}

export interface QuoteOk {
  kind: 'ok';
  lines: QuoteLine[];
  total: number;
  timeRule: TimeRule;
  slabLabel?: string; // absent for pickup
  isLateNight: boolean;
  latenightPrepaid: boolean;
  freeDeliveryNudge?: { needed: number; threshold: number };
}

export type QuoteResult = QuoteBeyond | QuoteBelowMinimum | QuoteOk;

export function computeQuote(cfg: DeliveryConfig, input: QuoteInput): QuoteResult {
  const { subtotal } = input;

  if (input.orderType === 'pickup') {
    const lines: QuoteLine[] = [
      { label: 'Food', amount: subtotal },
      { label: 'Pickup discount', amount: -cfg.pickup_discount },
    ];
    return {
      kind: 'ok',
      lines,
      total: subtotal - cfg.pickup_discount,
      timeRule: 'standard',
      isLateNight: false,
      latenightPrepaid: false,
    };
  }

  // Delivery path.
  if (input.km === null) return { kind: 'beyond', note: cfg.beyond_note };
  const slab = slabForDistance(cfg, input.km);
  if (!slab) return { kind: 'beyond', note: cfg.beyond_note };

  const isQuiet =
    isTimeInRange(input.time, cfg.quiet_hours.from, cfg.quiet_hours.to) &&
    parseDayRange(cfg.quiet_hours.days).has(input.dayOfWeek);
  const isLateNight = isTimeInRange(input.time, cfg.late_night.from, cfg.late_night.to);
  const timeRule: TimeRule = isLateNight ? 'late_night' : isQuiet ? 'quiet' : 'standard';

  let minimum = isQuiet ? slab.min_order_quiet : slab.min_order;
  if (isLateNight) minimum = Math.max(minimum, cfg.late_night.min_order);

  if (subtotal < minimum) {
    const result: QuoteBelowMinimum = { kind: 'below_minimum', minimum, short: minimum - subtotal };
    if (!isQuiet && slab.min_order_quiet < minimum && subtotal >= slab.min_order_quiet) {
      result.quietAlt = {
        minimum: slab.min_order_quiet,
        window: `${formatTimeRange(cfg.quiet_hours.from, cfg.quiet_hours.to)}, ${cfg.quiet_hours.days}`,
      };
    }
    return result;
  }

  const lines: QuoteLine[] = [{ label: 'Food', amount: subtotal }];

  const quietFeeApplies = isQuiet && slab.label === cfg.quiet_hours.applies_to_slab;
  let fee = quietFeeApplies ? cfg.quiet_hours.charge : slab.charge;

  const freeAbove = input.regular ? cfg.regulars.free_above : slab.free_above;
  const isFree = subtotal >= freeAbove;
  if (isFree) fee = 0;

  // Every price claim carries its unlocking condition in the same line
  // (owner rule, 2026-08-14) — "₹19 delivery" alone is misleading without
  // the minimum order that makes it reachable, same for the free line.
  lines.push({
    label: isFree
      ? `Delivery (${slab.label}) — free above ₹${freeAbove}`
      : quietFeeApplies
        ? `Delivery (${slab.label}, afternoon rate, min ₹${slab.min_order_quiet})`
        : `Delivery (${slab.label})`,
    amount: fee,
  });

  if (isLateNight) {
    lines.push({
      label: input.regular
        ? 'Late-night kitchen — waived for regulars'
        : `Late-night kitchen (prepaid, min ₹${cfg.late_night.min_order})`,
      amount: input.regular ? 0 : cfg.late_night.surcharge,
    });
  }
  if (cfg.rain.active) {
    lines.push({
      label: input.regular ? 'Rain surcharge — waived for regulars' : 'Rain surcharge',
      amount: input.regular ? 0 : cfg.rain.surcharge,
    });
  }
  // Step 8: the cap covers EVERY delivery-related charge, not just the base
  // fee. The banner promises "delivery never costs more than ₹X", and a
  // promise that quietly excludes surcharges is the kind of small print this
  // pricing was written to avoid. Shown as its own line so the breakdown
  // still explains where the money went.
  const deliveryCharges = lines
    .filter((l) => l.label !== 'Food')
    .reduce((sum, l) => sum + l.amount, 0);
  if (deliveryCharges > cfg.max_delivery_charge) {
    lines.push({
      label: `Delivery charges capped at ₹${cfg.max_delivery_charge}`,
      amount: cfg.max_delivery_charge - deliveryCharges,
    });
  }

  if (input.preorder) {
    lines.push({ label: 'Pre-order discount', amount: -cfg.preorder_discount });
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  let freeDeliveryNudge: { needed: number; threshold: number } | undefined;
  if (!isFree) {
    const needed = freeAbove - subtotal;
    if (needed > 0) freeDeliveryNudge = { needed, threshold: freeAbove };
  }

  return {
    kind: 'ok',
    lines,
    total,
    timeRule,
    slabLabel: slab.label,
    isLateNight,
    latenightPrepaid: isLateNight && cfg.late_night.prepaid,
    freeDeliveryNudge,
  };
}
