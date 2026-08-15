/**
 * The cart: what the customer has picked, remembered between pages.
 *
 * Deliberately small. It stores quantities against catalogue ids and nothing
 * else — no names, no prices, no customer details. Prices are re-read from the
 * build at render time, so a cart left open overnight cannot quote yesterday's
 * price, and a dish that has since sold out simply drops out of the basket
 * instead of being ordered.
 *
 * ids come from `data.ts` (`item-`/`combo-`/`addon-` + the catalogue code).
 * MEMORY.md pins those codes as stable join keys, which is exactly the property
 * a persisted cart needs.
 *
 * ## Why lines carry their own add-ons
 *
 * A basket holding two pizzas and a floating "Extra Cheese" is not an order the
 * kitchen can cook — it has to ring back and ask which pizza. So an add-on
 * belongs to the line it was ordered against, with its own quantity, and the
 * WhatsApp message nests it under that dish. An add-on can still be ordered on
 * its own (a dip in a tub), which is simply a line of its own.
 *
 * One line per distinct item: adding the same pizza twice increases that line
 * rather than making a second one. "Extra cheese on one of the two" is then
 * expressed by the add-on's quantity, which is what a kitchen reads anyway.
 *
 * Storage is localStorage, and every access is wrapped: Safari private mode
 * throws on write, and a browser with storage disabled must still be able to
 * order. When storage is unavailable the cart degrades to in-memory for the
 * page's lifetime rather than breaking the page.
 */

const KEY = 'ovenvibe.cart.v2';

/** One basket line: an item, how many, and the extras ordered on top of it. */
export interface CartLine {
  id: string;
  qty: number;
  /** addon id -> quantity. Empty for a line with no extras. */
  addons: Record<string, number>;
}

export type Cart = CartLine[];

/** Fallback when localStorage throws (private mode, storage disabled). */
let memory: Cart = [];
let storageWorks = true;

function sanitise(raw: unknown): Cart {
  if (!Array.isArray(raw)) return [];
  const out: Cart = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const id = typeof e.id === 'string' ? e.id : null;
    const qty = Math.floor(Number(e.qty));
    // A hand-edited or half-written entry must not poison the basket.
    if (!id || !Number.isFinite(qty) || qty <= 0) continue;
    const addons: Record<string, number> = {};
    if (e.addons && typeof e.addons === 'object' && !Array.isArray(e.addons)) {
      for (const [aid, aqty] of Object.entries(e.addons as Record<string, unknown>)) {
        const n = Math.floor(Number(aqty));
        if (Number.isFinite(n) && n > 0) addons[aid] = n;
      }
    }
    out.push({ id, qty, addons });
  }
  return out;
}

function read(): Cart {
  if (!storageWorks) return structuredClone(memory);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return sanitise(JSON.parse(raw));
  } catch {
    storageWorks = false;
    return structuredClone(memory);
  }
}

function write(cart: Cart) {
  memory = structuredClone(cart);
  if (!storageWorks) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    storageWorks = false;
  }
}

type Listener = (cart: Cart) => void;
const listeners = new Set<Listener>();

function commit(cart: Cart): Cart {
  const cleaned = cart.filter((l) => l.qty > 0);
  write(cleaned);
  for (const fn of listeners) fn(structuredClone(cleaned));
  return cleaned;
}

/** Current basket contents. */
export function getCart(): Cart {
  return read();
}

/**
 * Units in the basket — item quantities, including add-ons ordered on their
 * own. Extras attached to a line are not counted: they are part of that dish,
 * not another thing in the bag, and counting them makes the badge read high.
 */
export function cartCount(cart: Cart = read()): number {
  return cart.reduce((sum, line) => sum + line.qty, 0);
}

/** Add to (or create) the line for an item. Returns its new quantity. */
export function addItem(id: string, delta = 1): number {
  const cart = read();
  const line = cart.find((l) => l.id === id);
  if (line) {
    line.qty = Math.max(0, line.qty + delta);
    commit(cart);
    return line.qty;
  }
  if (delta <= 0) return 0;
  cart.push({ id, qty: delta, addons: {} });
  commit(cart);
  return delta;
}

/** Set an exact quantity for a line; 0 removes it, extras and all. */
export function setItemQty(id: string, qty: number): Cart {
  const cart = read();
  const line = cart.find((l) => l.id === id);
  const n = Math.max(0, Math.floor(qty));
  if (!line) {
    if (n > 0) cart.push({ id, qty: n, addons: {} });
  } else {
    line.qty = n;
  }
  return commit(cart);
}

/** Set how many of an add-on ride on a given line; 0 removes it. */
export function setAddonQty(lineId: string, addonId: string, qty: number): Cart {
  const cart = read();
  const line = cart.find((l) => l.id === lineId);
  if (!line) return cart;
  const n = Math.max(0, Math.floor(qty));
  if (n === 0) delete line.addons[addonId];
  else line.addons[addonId] = n;
  return commit(cart);
}

export function clearCart(): void {
  commit([]);
}

/**
 * Subscribe to changes. Fires for changes made on this page, and — via the
 * `storage` event — for changes made in another tab, so two open tabs cannot
 * show two different baskets.
 */
export function onCartChange(fn: Listener): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) fn(read());
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}
