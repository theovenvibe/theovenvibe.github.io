/* ============================================================================
 * The order outbox
 *
 * Before this existed, checkout sent the order with `.catch(() => {})` and
 * walked away. On 2026-08-19 that lost a paid Rs487 order: the Worker replied
 * 400, nothing was listening, and the kitchen had an ntfy alert with no order
 * behind it.
 *
 * A fetch that is not checked is a fetch that did not happen. So every order is
 * written to localStorage FIRST, sent second, and only removed once the Worker
 * has said yes. Anything still in the box is retried - on the next page load,
 * when the tab comes back to the foreground, and when the browser regains a
 * connection. Someone who taps send in a lift gets their order filed when they
 * reach the ground floor.
 *
 * What it deliberately does not do is block the customer. The WhatsApp handoff
 * happens either way: the kitchen can always cook from the message. This only
 * decides whether the order also lands in the system.
 * ========================================================================= */
import { publishNtfy } from './notify';

const KEY = 'ov_order_outbox';
/** Enough tries to outlast a tunnel or a lift; few enough to stop eventually. */
const MAX_ATTEMPTS = 8;

interface Queued {
  id: string;
  payload: unknown;
  attempts: number;
  first_tried_at: string;
  last_error?: string;
}

function read(): Queued[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: Queued[]): void {
  try {
    if (items.length) localStorage.setItem(KEY, JSON.stringify(items));
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode, or a full quota. Nothing useful left to do here - the send
    // below still runs, it just cannot be retried later.
  }
}

/** True when the order is beyond saving by retrying: the Worker understood it and said no. */
function isPermanent(status: number): boolean {
  return status >= 400 && status < 500 && status !== 408 && status !== 429;
}

let flushing = false;

/**
 * Try everything in the box once.
 *
 * Runs at most one at a time, so a foregrounded tab and a fired `online` event
 * cannot double-post the same order.
 */
export async function flushOutbox(workerUrl: string): Promise<void> {
  if (!workerUrl || flushing) return;
  const items = read();
  if (!items.length) return;

  flushing = true;
  try {
    const keep: Queued[] = [];
    for (const item of items) {
      let ok = false;
      let permanent = false;
      try {
        const res = await fetch(`${workerUrl}/orders`, {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });
        ok = res.ok;
        if (ok) {
          // The reply carries this customer's referral code. /refer/ reads it
          // from here - before the outbox existed the reply was discarded, so
          // that page showed "order once first" to people who had just ordered.
          try {
            const data = (await res.json()) as { referral_code?: string | null };
            if (data?.referral_code) localStorage.setItem('ov_my_referral_code', data.referral_code);
          } catch {
            // A success with an unreadable body is still a success.
          }
        }
        if (!ok) {
          permanent = isPermanent(res.status);
          item.last_error = `HTTP ${res.status}`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) item.last_error = data.error;
          } catch {
            // Non-JSON error body. The status code is enough to act on.
          }
        }
      } catch (err) {
        item.last_error = err instanceof Error ? err.message : 'network error';
      }

      if (ok) continue;

      item.attempts += 1;
      // A 4xx will say the same thing on the hundredth try. Give up on retrying
      // and make some noise instead - the Worker has kept the payload, but the
      // kitchen needs to know tonight, not at the end of the month.
      if (permanent || item.attempts >= MAX_ATTEMPTS) {
        alertKitchen(workerUrl, item);
        continue;
      }
      keep.push(item);
    }
    write(keep);
  } finally {
    flushing = false;
  }
}

/**
 * The order could not be filed. Say so, loudly, on the same channel the kitchen
 * already watches - a silent failure is the whole bug this file exists for.
 *
 * Carries no name or number: the ntfy topic has no access control. The alert
 * that fired when the customer tapped send already has the order text; this one
 * only has to say that the copy in the system is missing.
 */
function alertKitchen(workerUrl: string, item: Queued): void {
  const total = (item.payload as { total?: unknown } | null)?.total;
  publishNtfy(workerUrl, {
    title: 'ORDER NOT FILED - check WhatsApp',
    body:
      `An order was sent to WhatsApp but could not be saved to the system.\n\n` +
      (typeof total === 'number' ? `Total: Rs ${total}\n` : '') +
      `Reason: ${item.last_error ?? 'unknown'}\n` +
      `Tried ${item.attempts} times since ${item.first_tried_at}.\n\n` +
      `Cook from the WhatsApp message. The order is in Admin > Rejected orders.`,
    tags: 'rotating_light',
  });
}

/** File an order: stored first, sent second, removed only once it is safely in. */
export function queueOrder(workerUrl: string, payload: unknown): void {
  const items = read();
  items.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    attempts: 0,
    first_tried_at: new Date().toISOString(),
  });
  write(items);
  void flushOutbox(workerUrl);
}

/** Retry on every event that might mean the connection came back. */
export function watchOutbox(workerUrl: string): void {
  void flushOutbox(workerUrl);
  window.addEventListener('online', () => void flushOutbox(workerUrl));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void flushOutbox(workerUrl);
  });
}
