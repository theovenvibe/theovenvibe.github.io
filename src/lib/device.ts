/**
 * The device id: a random UUID in localStorage that links an anonymous
 * browser to a phone number once it orders (PRD §7.1), and links a push
 * subscription to the same customer once one is created. Same id, read by
 * both `/checkout/`'s order POST and the push-subscribe flow — never
 * regenerate one for the other, or the two can never link up.
 */
const DEVICE_ID_KEY = 'ovenvibe.device_id.v1';

export function getDeviceId(): string {
  try {
    let id = window.localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    // Storage unavailable — a fresh id this visit is still better than none.
    return crypto.randomUUID();
  }
}
