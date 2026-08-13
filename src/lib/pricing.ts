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
 *      regulars.free_above instead) — never during the late-night window.
 *   6. Add surcharges: late night, rain (when the caller says it is
 *      raining, defaulting to the rain.active flag).
 *   7. Subtract the pickup discount outside the late-night window (a pickup
 *      still reopens the kitchen), and only from pickup_min_order upwards.
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
  /** Customer is paying online now. Locks the price: no rain charge can be
   *  added at the door to an order that has already been paid for. */
  prepaid: boolean;
  regular: boolean;
  /** Customer ticked "it's raining". Defaults to the kitchen's rain.active flag
   *  when omitted, so the config stays the authoritative declaration. A customer
   *  can only ever add this charge to their own quote, never remove one. */
  rain?: boolean;
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
  /** Pickup only: how much more would unlock the pickup discount. */
  pickupNudge?: { needed: number; threshold: number; discount: number };
  /** Conditions the total depends on, addressed to the customer on the page. */
  notes?: string[];
  /** The same conditions written for the message the customer SENDS to the
   *  kitchen — stated as facts, since the reader there is the shop owner. */
  quoteNotes?: string[];
}

export type QuoteResult = QuoteBeyond | QuoteBelowMinimum | QuoteOk;

export function computeQuote(cfg: DeliveryConfig, input: QuoteInput): QuoteResult {
  const { subtotal } = input;

  const lateNight = isTimeInRange(input.time, cfg.late_night.from, cfg.late_night.to);

  if (input.orderType === 'pickup') {
    // Collecting your own order saves the ride, not the reopen — so the
    // kitchen charge still applies after closing and the usual pickup
    // discount does not. Same minimum either way: the oven costs the same.
    if (lateNight && subtotal < cfg.late_night.min_order) {
      return {
        kind: 'below_minimum',
        minimum: cfg.late_night.min_order,
        short: cfg.late_night.min_order - subtotal,
      };
    }
    const lines: QuoteLine[] = [{ label: 'Food', amount: subtotal }];
    // Below the threshold, tell them what the discount would take to reach —
    // the same courtesy the delivery side gets with its free-delivery nudge.
    let pickupNudge: { needed: number; threshold: number; discount: number } | undefined;
    if (!lateNight && subtotal < cfg.pickup_min_order) {
      pickupNudge = {
        needed: cfg.pickup_min_order - subtotal,
        threshold: cfg.pickup_min_order,
        discount: cfg.pickup_discount,
      };
    }
    if (lateNight) {
      lines.push({
        label: `Late-night kitchen (prepaid, min ₹${cfg.late_night.min_order})`,
        amount: input.regular ? 0 : cfg.late_night.kitchen_charge,
      });
    } else if (subtotal >= cfg.pickup_min_order) {
      lines.push({
        label: `Pickup discount (orders over ₹${cfg.pickup_min_order})`,
        amount: -cfg.pickup_discount,
      });
    }
    // Below the threshold there is simply no discount line: ₹30 off a ₹100
    // order is a loss, since the food itself only contributes about ₹15.
    return {
      kind: 'ok',
      lines,
      total: lines.reduce((sum, l) => sum + l.amount, 0),
      timeRule: lateNight ? 'late_night' : 'standard',
      isLateNight: lateNight,
      latenightPrepaid: lateNight && cfg.late_night.prepaid,
      pickupNudge,
    };
  }

  // Delivery path.
  if (input.km === null) return { kind: 'beyond', note: cfg.beyond_note };
  const slab = slabForDistance(cfg, input.km);
  if (!slab) return { kind: 'beyond', note: cfg.beyond_note };

  const isQuiet =
    isTimeInRange(input.time, cfg.quiet_hours.from, cfg.quiet_hours.to) &&
    parseDayRange(cfg.quiet_hours.days).has(input.dayOfWeek);
  const isLateNight = lateNight;
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
  // Free delivery does not survive into the late-night window: the ride costs
  // more at 1am, not less, and the window already carries its own minimum.
  const isFree = subtotal >= freeAbove && !isLateNight;
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
    // Split so the reader can see what picking up would save: the kitchen
    // charge stays either way, the delivery premium is the part that goes.
    lines.push({
      label: input.regular
        ? 'Late-night kitchen — waived for regulars'
        : `Late-night kitchen (prepaid, min ₹${cfg.late_night.min_order})`,
      amount: input.regular ? 0 : cfg.late_night.kitchen_charge,
    });
    lines.push({
      label: input.regular ? 'Late-night delivery — waived for regulars' : 'Late-night delivery',
      amount: input.regular ? 0 : cfg.late_night.delivery_premium,
    });
  }
  // A prepaid order cannot take a doorstep surcharge, so rain never applies to
  // one. This is the only thing prepaying buys, and it is worth more than the
  // charge: a confirmed order the kitchen can plan around.
  //
  // Prepaying waives rain OUTSIDE the late-night window only. After closing,
  // payment up front is the condition of firing the oven at all, not a waiver
  // — the kitchen takes the money in advance and still charges rain if it
  // rains on the ride. (Owner's rule, 2026-08-14.)
  const rainWaived = cfg.rain.waived_when_prepaid && input.prepaid && !isLateNight;
  const rainApplies = (input.rain ?? cfg.rain.active) && !rainWaived;
  if (rainApplies) {
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


  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  const notes: string[] = [];
  const quoteNotes: string[] = [];
  const rupees = String(cfg.rain.surcharge);
  if (isLateNight && cfg.late_night.prepaid) {
    // One line, both facts: paid up front, and rain still applies on the ride.
    notes.push(cfg.late_night.advance_note.replace('{surcharge}', rupees));
    quoteNotes.push(cfg.late_night.advance_note_quote.replace('{surcharge}', rupees));
  } else if (rainWaived) {
    notes.push(cfg.rain.prepaid_note);
    quoteNotes.push(cfg.rain.prepaid_note_quote.replace('{surcharge}', rupees));
  } else if (!rainApplies) {
    // Not raining as far as we know — but it might be by the time we ride.
    notes.push(cfg.rain.later_note.replace('{surcharge}', rupees));
    quoteNotes.push(cfg.rain.later_note_quote.replace('{surcharge}', rupees));
  }

  let freeDeliveryNudge: { needed: number; threshold: number } | undefined;
  if (!isFree && !isLateNight) {
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
    notes,
    quoteNotes,
  };
}
