/**
 * The order form controller: everything between "here is a basket" and "here is
 * a WhatsApp message the kitchen can act on".
 *
 * This used to live inside `price-calculator.astro`. It was lifted out when
 * `/checkout/` was added, because the two pages ask the customer exactly the
 * same questions — distance, slot, pickup-or-delivery, rain, prepayment — and
 * two copies of the late-night/rain/pre-order rules would drift apart. The
 * pricing arithmetic itself has always lived in `pricing.ts`; this file is the
 * DOM half, and it is deliberately the ONLY DOM half.
 *
 * The pages differ in exactly one thing: where the basket comes from. The
 * calculator lists the whole menu with steppers; checkout reads the cart. Both
 * express that as a `BasketRow[]`, and everything downstream is shared.
 *
 * The markup this drives is `components/OrderOptions.astro` — the element IDs
 * below are that component's contract, so both pages must render it.
 */
import { computeQuote, isTimeInRange, type QuoteResult } from './pricing';
import { publishNtfy, makeOnce } from './notify';
import type { SiteConfig } from '../schemas/site-config';

/**
 * An extra ordered on top of a basket line — "extra cheese, on that pizza".
 *
 * It is attached to its parent rather than sitting beside it because a basket
 * with two pizzas and a loose "Extra Cheese" is not an order anyone can cook.
 * Its price counts toward the subtotal, and the message nests it under the dish.
 */
export interface BasketExtra {
  name: string;
  price: number;
  qty: number;
}

/** One line of the basket, however the page happens to store it. */
export interface BasketRow {
  name: string;
  price: number;
  /** Is this item still cooked inside the late-night window? */
  lateNight: boolean;
  getQty(): number;
  setQty(n: number): void;
  /**
   * The kitchen cannot make this at the chosen slot. The page decides what
   * that looks like — greying a stepper, or striking out a cart line.
   */
  setUnavailable(off: boolean): void;
  /** Extras ordered on this line. The calculator has none; checkout may. */
  extras?: BasketExtra[];
}

export interface OrderFormConfig {
  delivery: SiteConfig['delivery'];
  whatsapp: string;
  businessName: string;
  hours: { open: string; close: string; display: string };
  /** The backend Worker's URL — alerts go through its /alert proxy now. */
  workerUrl: string;
}

export interface OrderFormHooks {
  /** Re-read on every update, so a cart that changes under us is picked up. */
  rows(): BasketRow[];
  /** Shown in the output area when the basket is empty. */
  emptyMessage?: string;
  /** Fired after every recalculation, for a page-level summary or badge. */
  onUpdate?(state: { subtotal: number; result: QuoteResult | null }): void;
  /**
   * Lines placed at the very top of the WhatsApp message, above the items —
   * checkout puts the customer's name and number here so the kitchen can call
   * without scrolling. These go in the MESSAGE ONLY.
   *
   * Whether these also go into the ntfy alert is `alertIncludesCustomer`.
   */
  leadLines?(): string[];
  /**
   * Put `leadLines` in the ntfy alert as well as the WhatsApp message.
   *
   * Off by default, and the default is the safe one: a free ntfy topic has no
   * access control (skills/setup-order-alerts.md), so anything published there
   * should be assumed public — including, if this is on, customers' phone
   * numbers.
   *
   * `/checkout/` turns it ON, by the owner's explicit decision (2026-08-15):
   * the alert is the kitchen's working copy of the order and they want to be
   * able to ring the customer straight from it. The mitigation, if that
   * exposure ever matters, is to put the topic behind a proxy that keeps its
   * name secret — see docs/CART_AND_CHECKOUT.md.
   */
  alertIncludesCustomer?: boolean;
  /**
   * Is the order complete enough to send? Checked on every recalculation to
   * decide whether the buttons are live. Must be side-effect free — it runs
   * constantly, including before the customer has typed anything, so it must
   * not throw errors onto the screen.
   */
  canSend?(): boolean;
  /**
   * Last check before the order actually leaves. Return false to stop it, and
   * mark up the offending field while you are there.
   *
   * This is a second, independent gate. `canSend` greys the button out, but a
   * disabled-looking button is a presentation detail — a stray click handler,
   * a script, or a browser restoring form state could still get here. Nothing
   * may leave without passing this.
   */
  beforeSend?(): boolean;
  /**
   * What the primary button does.
   *
   * `whatsapp` (default) sends the order to the kitchen — that is `/checkout/`,
   * the one page that has the customer's name and number.
   *
   * `handoff` carries the basket to another page instead. The price calculator
   * uses this: it is where you work out a total, not where an order is placed,
   * and sending from there produced an order the kitchen could not call back
   * about. It fires no alert, because nothing has been ordered yet.
   */
  primaryAction?: 'whatsapp' | 'handoff';
  /** Where `handoff` goes. */
  handoffHref?: string;
  /** Called just before a `handoff` navigation — write the basket out here. */
  onHandoff?(): void;
}

export interface OrderForm {
  /** Recalculate now — call after the page mutates the basket. */
  update(): void;
}

export function initOrderForm(CFG: OrderFormConfig, hooks: OrderFormHooks): OrderForm {
  const delivery = CFG.delivery;
  const isHandoff = hooks.primaryAction === 'handoff';

  const distanceRadios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="distance"]'));
  const kmInput = document.getElementById('kmInput') as HTMLInputElement;
  const timeInput = document.getElementById('timeInput') as HTMLInputElement;
  const dateInput = document.getElementById('dateInput') as HTMLInputElement;
  const timeRuleNote = document.getElementById('timeRuleNote') as HTMLElement;
  const orderTypeRadios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="orderType"]'));
  const prepaidCheck = document.getElementById('prepaidCheck') as HTMLInputElement;
  const pastNote = document.getElementById('pastNote') as HTMLParagraphElement;
  const preorderCheck = document.getElementById('preorderCheck') as HTMLInputElement;
  const preorderNote = document.getElementById('preorderNote') as HTMLParagraphElement;
  const weatherNote = document.getElementById('weatherNote') as HTMLParagraphElement;
  const otherGroup = document.getElementById('otherGroup') as HTMLFieldSetElement;
  const prepaidLabel = document.getElementById('prepaidLabel') as HTMLLabelElement;
  const rainCheck = document.getElementById('rainCheck') as HTMLInputElement;
  const availabilityNote = document.getElementById('availabilityNote') as HTMLParagraphElement;
  const rainLabel = document.getElementById('rainLabel') as HTMLLabelElement;
  const rainHint = document.getElementById('rainHint') as HTMLElement;
  const output = document.getElementById('quoteOutput') as HTMLElement;
  const copyBtn = document.getElementById('copyQuoteBtn') as HTMLButtonElement;
  const waLink = document.getElementById('waShareLink') as HTMLAnchorElement;

  /** After closing the only thing left in "Other" is rain, which a pickup never pays. */
  const rainOffForLate = (orderType: string) => orderType === 'pickup';

  // Date and time default to "now" from the browser clock, but both stay
  // editable: the afternoon rate is weekday-only, so quoting a Saturday
  // order on a Wednesday (or vice versa) needs the day, not just the time.
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const timeStr = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // The page follows the clock until the visitor deliberately picks a slot.
  // Without this, a quote taken at 01:55 still claims late-night pricing at
  // 02:05, when the kitchen has actually closed — the same trap exists at
  // 11:30am and 4pm, wherever a rule changes.
  let followingClock = true;

  /** Earliest slot the kitchen will accept: now, or now + prep notice. */
  function earliest(): Date {
    const n = new Date();
    if (!preorderCheck.checked) return n;
    return new Date(n.getTime() + delivery.preorder.min_hours_ahead * 3600000);
  }

  function applyEarliest() {
    const e = earliest();
    dateInput.value = dateStr(e);
    timeInput.value = timeStr(e);
    dateInput.min = dateStr(e);
    timeInput.min = timeStr(e);
  }

  function applyNow() {
    const n = new Date();
    dateInput.value = dateStr(n);
    timeInput.value = timeStr(n);
    dateInput.min = dateStr(n);
    timeInput.min = timeStr(n);
  }

  /** Nothing before the earliest slot the kitchen can actually cook for. */
  function clampToEarliest(): boolean {
    const e = earliest();
    dateInput.min = dateStr(e);
    timeInput.min = dateInput.value === dateStr(e) ? timeStr(e) : '';
    const chosen = chosenDate();
    if (chosen && chosen.getTime() >= e.getTime() - 1000) return false;
    applyEarliest();
    if (!preorderCheck.checked) followingClock = true;
    return true;
  }

  function chosenDate(): Date | null {
    const [y, mo, da] = dateInput.value.split('-').map(Number);
    const [h, mi] = (timeInput.value || '00:00').split(':').map(Number);
    if ([y, mo, da, h, mi].some(Number.isNaN)) return null;
    return new Date(y, mo - 1, da, h, mi);
  }

  applyNow();
  dateInput.disabled = true;
  timeInput.disabled = true;

  function currentDayOfWeek(): number {
    const parts = dateInput.value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date().getDay();
    return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
  }

  type KitchenState = 'open' | 'late_night' | 'closed';

  /** Late night wins over opening hours: the window deliberately starts at
   *  closing time, when the kitchen reopens only for what it can still cook. */
  function kitchenState(time: string): KitchenState {
    if (isTimeInRange(time, delivery.late_night.from, delivery.late_night.to)) return 'late_night';
    if (isTimeInRange(time, CFG.hours.open, CFG.hours.close)) return 'open';
    return 'closed';
  }

  /**
   * Names of rows the kitchen cannot cook at the currently-chosen time.
   * Excluded from the total and the quote (below), but their quantity is
   * left untouched in the basket — landing on checkout with the kitchen
   * closed must not silently delete what was added earlier. A customer
   * who ticks "Pre-order" for a time inside hours gets those items back
   * automatically, since nothing was ever removed.
   */
  const unavailableNames = new Set<string>();

  function applyAvailability(state: KitchenState) {
    unavailableNames.clear();
    hooks.rows().forEach((row) => {
      const off = state === 'closed' || (state === 'late_night' && !row.lateNight);
      row.setUnavailable(off);
      if (off) unavailableNames.add(row.name);
    });

    if (state === 'closed') {
      availabilityNote.hidden = false;
      availabilityNote.className = 'calc-availability calc-availability--closed';
      availabilityNote.textContent = preorderCheck.checked
        ? `That time is still outside our hours — we open at ${formatOpen()}. Pick a later time to see your total; nothing in your basket is lost.`
        : `Kitchen is closed right now — we open at ${formatOpen()}. Tick "Pre-order" below and choose a time after we open; we'll confirm your order once the kitchen's back. Nothing in your basket is lost.`;
    } else if (state === 'late_night') {
      availabilityNote.hidden = false;
      availabilityNote.className = 'calc-availability calc-availability--late';
      availabilityNote.textContent = delivery.late_night.menu_note;
    } else {
      availabilityNote.hidden = true;
      availabilityNote.textContent = '';
    }
  }

  function formatOpen(): string {
    const [h, m] = CFG.hours.open.split(':').map(Number);
    const suffix = h < 12 ? 'AM' : 'PM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}${m ? ':' + String(m).padStart(2, '0') : ''} ${suffix}`;
  }

  /** Extras only count while their line is actually in the basket. */
  function extrasTotal(row: BasketRow): number {
    if (row.getQty() === 0) return 0;
    return (row.extras ?? []).reduce((sum, e) => sum + e.qty * e.price, 0);
  }

  function subtotal(): number {
    return hooks
      .rows()
      .filter((row) => !unavailableNames.has(row.name))
      .reduce((sum, row) => sum + row.getQty() * row.price + extrasTotal(row), 0);
  }

  function chosenItems(): BasketRow[] {
    return hooks.rows().filter((row) => row.getQty() > 0 && !unavailableNames.has(row.name));
  }

  function isBeyond(): boolean {
    if (kmInput.value.trim() !== '') {
      return Number(kmInput.value) > delivery.slabs[delivery.slabs.length - 1].km_to;
    }
    const checked = distanceRadios.find((r) => r.checked);
    return checked?.value === 'beyond4';
  }

  function distanceKm(): number | null {
    if (kmInput.value.trim() !== '') return Number(kmInput.value);
    const checked = distanceRadios.find((r) => r.checked);
    if (!checked) return null;
    if (checked.value === 'under2') return 1;
    if (checked.value === '2to4') return 3;
    return null;
  }

  function rupee(n: number): string {
    const sign = n < 0 ? '-' : '';
    return `${sign}₹${Math.abs(Math.round(n))}`;
  }

  function timeRuleLabel(time: string): string {
    // Mirrors computeQuote's own gating so the note is accurate before any
    // items are picked (computeQuote only runs once there's a slab match).
    const state = kitchenState(time);

    if (state === 'closed') return `Kitchen closed — opens ${formatOpen()}`;
    if (state === 'late_night') return 'Late-night (limited menu)';
    if (isTimeInRange(time, delivery.quiet_hours.from, delivery.quiet_hours.to))
      return 'Afternoon rate (weekdays only)';
    return 'Standard';
  }

  /** "Friday, 15 Aug at 8:00pm" for the slot currently chosen. */
  function slotLabel(): string {
    const [y, mo, da] = dateInput.value.split('-').map(Number);
    const [h, mi] = (timeInput.value || '00:00').split(':').map(Number);
    if ([y, mo, da, h, mi].some(Number.isNaN)) return '';
    const when = new Date(y, mo - 1, da, h, mi);
    const day = when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
    const suffix = h < 12 ? 'am' : 'pm';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${day} at ${hour}:${String(mi).padStart(2, '0')}${suffix}`;
  }

  /**
   * The order as text.
   *
   * `withCustomer` exists because the same order has two audiences. The
   * WhatsApp message always carries the customer's name and number. The ntfy
   * alert carries them only when the page opts in (`alertIncludesCustomer`),
   * because that topic has no access control on free ntfy and should be
   * treated as public — see skills/setup-order-alerts.md.
   */
  function buildQuoteText(result: QuoteResult, withCustomer: boolean): string {
    const lines: string[] = [`${CFG.businessName} — price quote`];
    // Who is ordering, before what they ordered — the kitchen reads this on a
    // phone and needs the callback number without scrolling.
    if (withCustomer) for (const lead of hooks.leadLines?.() ?? []) lines.push(lead);
    // A pre-order is an appointment, not a hint: name the slot the customer
    // picked so the kitchen reads WHEN before it reads what.
    if (preorderCheck.checked) {
      const slot = slotLabel();
      if (slot) lines.push(`Pre-order — I want this on ${slot}.`);
    }
    for (const it of chosenItems()) {
      lines.push(`${it.name} x${it.getQty()} — ₹${it.price * it.getQty()}`);
      // Indented under their dish, so the kitchen never has to ask which pizza
      // the extra cheese was for.
      for (const extra of it.extras ?? []) {
        lines.push(`   + ${extra.name} x${extra.qty} — ₹${extra.price * extra.qty}`);
      }
    }
    if (result.kind === 'ok') {
      for (const l of result.lines) lines.push(`${l.label}: ${rupee(l.amount)}`);
      lines.push(`Total: ${rupee(result.total)}`);
      // The copied text is sent BY the customer TO the kitchen, so it uses the
      // quote-voice variants: facts about the order, not instructions to pay.
      for (const n of result.quoteNotes ?? []) lines.push(n);
    } else if (result.kind === 'below_minimum') {
      lines.push(
        `My order is below the ₹${result.minimum} minimum — I need to add ${rupee(result.short)} more.`,
      );
    } else {
      lines.push('I am beyond your delivery range, so I will order through Zomato or Swiggy.');
    }
    return lines.join('\n');
  }

  function clear(el: HTMLElement) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function textEl(tag: string, className: string, text: string): HTMLElement {
    const el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    return el;
  }

  /**
   * The order text WITHOUT the customer's name or number — the only thing that
   * may be published to the ntfy topic. Never read `copyBtn.dataset.quote` for
   * an alert: that one is the private WhatsApp message and carries PII.
   */
  let alertText = '';

  function disableActions() {
    copyBtn.disabled = true;
    delete copyBtn.dataset.quote;
    delete copyBtn.dataset.total;
    alertText = '';
    waLink.removeAttribute('href');
    waLink.setAttribute('aria-disabled', 'true');
  }

  function renderOutput(result: QuoteResult) {
    clear(output);

    if (result.kind === 'beyond') {
      output.appendChild(textEl('p', 'calc-note calc-note--warn', result.note));
      disableActions();
      return;
    }

    if (result.kind === 'below_minimum') {
      output.appendChild(
        textEl(
          'p',
          'calc-note calc-note--warn',
          `Add ${rupee(result.short)} more to reach the ₹${result.minimum} minimum for this order.`,
        ),
      );
      if (result.quietAlt) {
        output.appendChild(
          textEl(
            'p',
            'calc-note',
            `Or order between ${result.quietAlt.window} — the minimum there is only ₹${result.quietAlt.minimum}.`,
          ),
        );
      }
      disableActions();
      return;
    }

    const dl = document.createElement('dl');
    dl.className = 'calc-breakdown';
    for (const l of result.lines) {
      dl.appendChild(textEl('dt', '', l.label));
      dl.appendChild(textEl('dd', '', rupee(l.amount)));
    }
    dl.appendChild(textEl('dt', 'calc-total-label', 'Total'));
    dl.appendChild(textEl('dd', 'calc-total-amount', rupee(result.total)));
    output.appendChild(dl);

    if (result.latenightPrepaid) {
      output.appendChild(textEl('p', 'calc-note', 'Late-night orders are paid online in advance.'));
    }
    for (const note of result.notes ?? []) {
      output.appendChild(textEl('p', 'calc-note', note));
    }

    if (result.pickupNudge) {
      output.appendChild(
        textEl(
          'p',
          'calc-note',
          `Add ${rupee(result.pickupNudge.needed)} more to reach ${rupee(result.pickupNudge.threshold)} and take ${rupee(result.pickupNudge.discount)} off this pickup.`,
        ),
      );
    }

    if (result.freeDeliveryNudge) {
      output.appendChild(
        textEl(
          'p',
          'calc-note calc-note--nudge',
          `Add ${rupee(result.freeDeliveryNudge.needed)} more for free delivery.`,
        ),
      );
    }

    // The quote above stays on screen either way — seeing the price is what the
    // customer came for. Only the send controls wait on a complete order.
    if (hooks.canSend && !hooks.canSend()) {
      disableActions();
      return;
    }

    copyBtn.disabled = false;
    const text = buildQuoteText(result, true);
    copyBtn.dataset.quote = text;
    copyBtn.dataset.total = String(result.total);
    // Kept apart from the message on purpose: this is what gets published to a
    // world-readable topic, so it is built without the customer's details.
    alertText = buildQuoteText(result, hooks.alertIncludesCustomer === true);
    waLink.href = isHandoff
      ? (hooks.handoffHref ?? '/checkout/')
      : `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
    waLink.removeAttribute('aria-disabled');
  }

  function update() {
    const orderType = (orderTypeRadios.find((r) => r.checked)?.value ?? 'delivery') as 'delivery' | 'pickup';
    const time = timeInput.value || '12:00';
    const state = kitchenState(time);

    // Three weather cases, and only one of them is a tick box.
    //   pickup            -> no ride, so no rain charge at all
    //   ordering for later -> nobody knows the weather; state the rule instead
    //   paid online        -> price locked, no doorstep surcharge is possible
    const isPickup = orderType === 'pickup';
    // "Later" is now the customer's own declaration, not a guess from the clock.
    const later = preorderCheck.checked;

    // Paying up front only changes the price by waiving rain, and a pickup has
    // no ride to rain on — so the control cannot move a single rupee here and
    // is hidden outright rather than sitting there claiming to "lock" a price.
    // The prepaid tick is only a choice outside the late-night window. After
    // closing, paying up front is the condition of cooking at all — and on a
    // pickup nothing in this group applies, so the whole group goes.
    const lateNow = state === 'late_night';
    prepaidLabel.hidden = lateNow;
    prepaidCheck.disabled = isPickup || lateNow;
    otherGroup.hidden = isPickup || (lateNow && rainOffForLate(orderType));
    const prepaid = prepaidCheck.checked && !isPickup && !lateNow;
    const rainBoxUsable = !isPickup && !later && !prepaid;

    rainCheck.disabled = !rainBoxUsable;
    rainLabel.classList.toggle('calc-check--off', !rainBoxUsable);
    rainHint.hidden = !isPickup;
    rainLabel.hidden = isPickup ? false : later || prepaid;

    if (isPickup) {
      weatherNote.hidden = true;
    } else if (prepaid) {
      weatherNote.hidden = false;
      weatherNote.className = 'calc-note calc-note--good';
      weatherNote.textContent = delivery.rain.prepaid_note;
    } else if (later) {
      weatherNote.hidden = false;
      weatherNote.className = 'calc-note calc-note--warn';
      weatherNote.textContent = delivery.rain.later_note.replace(
        '{surcharge}',
        String(delivery.rain.surcharge),
      );
    } else {
      weatherNote.hidden = true;
    }
    // Availability first: it can empty the basket, so the subtotal is read after.
    applyAvailability(state);

    const sub = subtotal();
    timeRuleNote.textContent = `Rule at this time: ${timeRuleLabel(time)}`;

    if (state === 'closed') {
      clear(output);
      output.appendChild(
        textEl(
          'p',
          'calc-note calc-note--warn',
          preorderCheck.checked
            ? `${time} is still outside our hours — we open at ${formatOpen()}. Choose a later time to see your total.`
            : `Kitchen is closed at ${time} — we open at ${formatOpen()}. Tick "Pre-order" above to schedule this for when we're open; we'll confirm it then.`,
        ),
      );
      disableActions();
      hooks.onUpdate?.({ subtotal: sub, result: null });
      return;
    }

    if (sub === 0) {
      clear(output);
      output.appendChild(
        textEl('p', 'calc-note', hooks.emptyMessage ?? 'Add items above to see your total.'),
      );
      disableActions();
      hooks.onUpdate?.({ subtotal: sub, result: null });
      return;
    }

    const beyond = isBeyond();
    const km = orderType === 'pickup' ? null : beyond ? null : distanceKm();

    const result = computeQuote(delivery, {
      subtotal: sub,
      km,
      time,
      dayOfWeek: currentDayOfWeek(),
      orderType,
      prepaid: prepaidCheck.checked,
      rain: rainCheck.checked,
      // The regulars waiver is applied by the kitchen when it quotes, not
      // self-declared here: there is no way to verify it on a public page.
      regular: false,
    });

    renderOutput(result);
    hooks.onUpdate?.({ subtotal: sub, result });
  }

  /**
   * Typing an exact distance moves the radio to the band that distance falls
   * in. Before this, entering 3.2 left "Under 2 km" selected while the quote
   * silently priced the 2–4 km slab — the page contradicted itself, and the
   * band is the part a customer actually reads. The number stays the source of
   * truth (`distanceKm` prefers it); the radio is brought into line with it.
   */
  function syncDistanceRadio() {
    const raw = kmInput.value.trim();
    if (raw === '') return;
    const km = Number(raw);
    if (!Number.isFinite(km) || km < 0) return;
    const slab = delivery.slabs.find((s) => km <= s.km_to);
    const value = !slab ? 'beyond4' : slab === delivery.slabs[0] ? 'under2' : '2to4';
    for (const radio of distanceRadios) radio.checked = radio.value === value;
  }

  [...distanceRadios, ...orderTypeRadios].forEach((el) =>
    el.addEventListener('change', () => {
      // Picking a band by hand discards a typed distance, otherwise the typed
      // number would keep overriding the radio the customer just clicked.
      if (distanceRadios.includes(el as HTMLInputElement)) kmInput.value = '';
      update();
    }),
  );
  kmInput.addEventListener('input', () => {
    syncDistanceRadio();
    update();
  });

  function preorderText(): string {
    return (
      delivery.preorder.note.replace('{hours}', String(delivery.preorder.min_hours_ahead)) +
      ' ' +
      delivery.preorder.earliest_note.replace('{earliest}', slotLabel())
    );
  }

  function onPreorderToggled() {
    const on = preorderCheck.checked;
    dateInput.disabled = !on;
    timeInput.disabled = !on;
    followingClock = !on;
    if (on) {
      applyEarliest();
      preorderNote.hidden = false;
      preorderNote.className = 'calc-note';
      preorderNote.textContent = preorderText();
    } else {
      applyNow();
      preorderNote.hidden = true;
    }
    update();
  }
  preorderCheck.addEventListener('change', onPreorderToggled);

  function onSlotEdited() {
    followingClock = false;
    const snapped = clampToEarliest();
    if (snapped) {
      pastNote.hidden = false;
      pastNote.textContent = preorderCheck.checked
        ? `${delivery.preorder.note.replace('{hours}', String(delivery.preorder.min_hours_ahead))} Moved to ${slotLabel()}.`
        : "We can't quote for a time that has already passed — showing now instead.";
      window.setTimeout(() => (pastNote.hidden = true), 6000);
    }
    if (preorderCheck.checked) {
      preorderNote.textContent = preorderText();
    }
    update();
  }
  timeInput.addEventListener('input', onSlotEdited);
  dateInput.addEventListener('input', onSlotEdited);

  // While the visitor is still on "now", keep the clock current so the rule and
  // the total stay true. Skipped while either field has focus, so a half-typed
  // time is never overwritten mid-keystroke.
  window.setInterval(() => {
    if (!followingClock) {
      if (clampToEarliest()) update();
      return;
    }
    if (document.activeElement === timeInput || document.activeElement === dateInput) return;
    const n = new Date();
    if (timeInput.value === timeStr(n) && dateInput.value === dateStr(n)) return;
    applyNow();
    update();
  }, 30000);
  prepaidCheck.addEventListener('change', update);
  rainCheck.addEventListener('change', update);

  // ---------------------------------------------------------------------------
  // Order alert (ntfy.sh)
  //
  // The kitchen's problem is not the quote, it is that nobody is staring at
  // WhatsApp when the message lands. So the moment a customer commits to
  // ordering — opening WhatsApp with the quote, or copying it to paste
  // themselves — we publish the same text to an ntfy.sh topic that every phone
  // and the laptop are subscribed to, at urgent priority so it makes a sound.
  //
  // This is an order *intent*, not a confirmed order: it fires on the click,
  // and the customer may still abandon before sending. False alarms are the
  // price of never missing a real one, and the wording says so.
  //
  // No secret ships here, and none can: free ntfy has no access control, so the
  // topic name IS the password and must stay long and random. That is only
  // acceptable while the body carries no customer name, phone or address — do
  // not add any. See skills/setup-order-alerts.md.
  // ---------------------------------------------------------------------------

  /** One alert per distinct quote — a double-tap must not ring four phones twice. */
  const once = makeOnce();

  /**
   * "Someone is heading to checkout with this basket." Not an order — the
   * matching order alert, if it comes, arrives seconds later at urgent
   * priority. Silence after one of these is the abandonment.
   */
  function notifyHandoff(text: string) {
    if (!text || !once(`handoff:${text}`)) return;
    const total = copyBtn.dataset.total;
    publishNtfy(CFG.workerUrl, {
      title: total ? `Building an order - Rs ${total}` : 'Building an order',
      body:
        'Someone worked out a total on the price calculator and went to checkout.\n' +
        'Nothing is ordered yet. If no order alert follows in a few minutes, they left without ordering.\n\n' +
        text,
      priority: 'low',
      tags: 'thinking_face',
    });
  }

  function notifyKitchen(text: string, via: 'whatsapp' | 'copy') {
    if (!text || !once(`${via}:${text}`)) return;

    const total = copyBtn.dataset.total;
    const orderType = orderTypeRadios.find((r) => r.checked)?.value ?? 'delivery';

    publishNtfy(CFG.workerUrl, {
      title: total ? `New order Rs ${total} (${orderType})` : `New order enquiry (${orderType})`,
      // `text` is the PII-free build — see buildQuoteText's `withCustomer`.
      body: `${via === 'whatsapp' ? 'Opened WhatsApp to send:' : 'Copied the quote:'}\n\n${text}`,
      tags: 'pizza',
    });
  }

  waLink.addEventListener('click', (event) => {
    if (waLink.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      // Greyed out, but a tap still deserves an answer. Run the same checks so
      // the customer is told which field is holding the order up, instead of
      // pressing a dead button and guessing.
      hooks.beforeSend?.();
      return;
    }
    // Validation happens here, not by greying the button out: the customer
    // must be told which field is wrong, not left tapping a dead control.
    if (hooks.beforeSend && !hooks.beforeSend()) {
      event.preventDefault();
      return;
    }
    if (isHandoff) {
      hooks.onHandoff?.();
      // Nothing is ordered yet — this is someone carrying a basket to the page
      // that can take an order. It is still worth knowing: pair it with the
      // order alert that may follow, and a handoff with no order behind it is
      // the clearest abandonment signal this site can produce.
      //
      // LOW priority on purpose. It must not sound like an order — at 1am the
      // phone should not ring for someone browsing.
      notifyHandoff(alertText);
      return;
    }
    notifyKitchen(alertText, 'whatsapp');
  });

  copyBtn.addEventListener('click', async () => {
    const text = copyBtn.dataset.quote ?? '';
    if (!text) return;
    // A copied quote is pasted into WhatsApp by hand, so it needs the same
    // details as a sent one — otherwise the kitchen gets an anonymous order.
    if (hooks.beforeSend && !hooks.beforeSend()) return;
    notifyKitchen(alertText, 'copy');
    try {
      await navigator.clipboard.writeText(text);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = original), 1500);
    } catch {
      // Clipboard API unavailable (older browser / no permission) — the
      // WhatsApp link still works as a fallback.
    }
  });

  update();

  return { update };
}
