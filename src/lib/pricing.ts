/** Shared delivery quote engine for the calculator and checkout. */
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
  /** km as a plain number, or null when the visitor picked beyond the direct-delivery area. */
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

export type TimeRule = 'late_night' | 'standard';

export interface QuoteBeyond {
  kind: 'beyond';
  note: string;
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

export type QuoteResult = QuoteBeyond | QuoteOk;

export function computeQuote(cfg: DeliveryConfig, input: QuoteInput): QuoteResult {
  const lateNight = isTimeInRange(input.time, cfg.late_night.from, cfg.late_night.to);
  const lines: QuoteLine[] = [{ label: 'Food', amount: input.subtotal }];
  const notes: string[] = [];
  const quoteNotes: string[] = [];

  if (input.orderType === 'pickup') {
    if (lateNight) {
      lines.push({ label: 'Late-night kitchen reopen surge (prepaid)', amount: cfg.late_night.kitchen_charge });
      notes.push(cfg.late_night.explain_note.replace(' Collecting it yourself saves the ₹{ride} delivery charge.', ''));
      notes.push(cfg.late_night.advance_note);
      quoteNotes.push(cfg.late_night.pickup_note_quote);
    } else {
      quoteNotes.push(cfg.pickup_note_quote);
    }
    return {
      kind: 'ok', lines, total: lines.reduce((sum, line) => sum + line.amount, 0),
      timeRule: lateNight ? 'late_night' : 'standard', isLateNight: lateNight,
      latenightPrepaid: lateNight && cfg.late_night.prepaid, notes, quoteNotes,
    };
  }

  if (input.km === null || !Number.isFinite(input.km) || input.km < 0) {
    return { kind: 'beyond', note: cfg.beyond_note };
  }
  const slab = slabForDistance(cfg, input.km);
  if (!slab) return { kind: 'beyond', note: cfg.beyond_note };

  // Each band's threshold is inclusive, as in the existing ₹499 rule.
  // Late-night free delivery remains disabled under the approved prior policy.
  const isFree = slab.free_above !== undefined && input.subtotal >= slab.free_above && !lateNight;
  lines.push({
    label: isFree ? `Delivery (${slab.label}) — free from ₹${slab.free_above}` : `Delivery (${slab.label})`,
    amount: isFree ? 0 : slab.charge,
  });
  if (lateNight) {
    lines.push({ label: 'Late-night kitchen reopen surge (prepaid)', amount: cfg.late_night.kitchen_charge });
    notes.push(cfg.late_night.explain_note.replace('{ride}', String(slab.charge)));
    quoteNotes.push(cfg.late_night.explain_note_quote);
    notes.push(cfg.late_night.advance_note);
    quoteNotes.push(cfg.late_night.advance_note_quote);
  }

  const rainApplies = cfg.rain.active || input.rain === true;
  // Prepayment locks out a later weather adjustment, never an active charge
  // already included in the final payable amount.
  const priceLocked = cfg.rain.waived_when_prepaid && input.prepaid && !lateNight;
  if (rainApplies) {
    lines.push({ label: input.regular ? 'Rain surcharge — waived for regulars' : 'Rain surcharge',
      amount: input.regular ? 0 : cfg.rain.surcharge });
  }
  if (!lateNight) {
    if (priceLocked) {
      notes.push(cfg.rain.prepaid_note);
      quoteNotes.push(cfg.rain.prepaid_note_quote);
    } else if (!rainApplies) {
      notes.push(cfg.rain.later_note.replace('{surcharge}', String(cfg.rain.surcharge)));
      quoteNotes.push(cfg.rain.later_note_quote.replace('{surcharge}', String(cfg.rain.surcharge)));
    }
  }

  const freeDeliveryNudge = slab.free_above !== undefined && !lateNight && !isFree
    ? { needed: slab.free_above - input.subtotal, threshold: slab.free_above }
    : undefined;
  return {
    kind: 'ok', lines, total: lines.reduce((sum, line) => sum + line.amount, 0),
    timeRule: lateNight ? 'late_night' : 'standard', slabLabel: slab.label,
    isLateNight: lateNight, latenightPrepaid: lateNight && cfg.late_night.prepaid,
    freeDeliveryNudge, notes, quoteNotes,
  };
}
