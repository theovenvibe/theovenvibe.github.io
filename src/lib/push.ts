/**
 * Web Push plumbing, shared by every place that asks for permission.
 *
 * Extracted from `PushSubscribe.astro` when the sold-out cards grew their own
 * "tell me when it's back" ask (P0-J). Two copies of subscribe logic would have
 * drifted, and the copy that drifts is the one that silently stops registering
 * subscribers — a failure nobody notices, because the symptom is an absence.
 *
 * Nothing here may import `lib/data.ts`: that reads menu.json with readFileSync
 * at build time, and bundling it for the browser throws and kills the whole
 * module (owner-reported, 2026-08-17).
 */
import { getDeviceId } from './device';

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** PRD §4.2: push on iOS works only once installed. Never ask before that. */
export function iosNotInstalled(): boolean {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return isIOS && !isStandalone();
}

/**
 * Can we still win a permission from this visitor?
 *
 * `denied` is the one that matters: the browser will never show the prompt
 * again for this origin, so anything relying on push has to offer another way
 * through rather than a button that quietly does nothing.
 */
export function pushPermission(): NotificationPermission | 'unsupported' {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission;
}

/** VAPID key ships base64url; the Push API wants a raw Uint8Array. */
function urlBase64ToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Subscribe this device and register it with the Worker. Throws on failure. */
export async function subscribeToPush(vapidPublicKey: string, workerUrl: string): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  });
  const json = subscription.toJSON();
  await fetch(`${workerUrl}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: getDeviceId(),
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    }),
  });
}

/**
 * Ask, then subscribe — the soft-ask's second half.
 *
 * Only ever called from a real tap. Firing `requestPermission()` on page load
 * is how an origin gets itself permanently blocked, and a block cannot be
 * undone from our side.
 *
 * Returns what happened so the caller can offer a way through on `denied`
 * rather than leaving the customer with a button that did nothing.
 */
export async function askAndSubscribe(
  vapidPublicKey: string,
  workerUrl: string,
): Promise<'granted' | 'denied' | 'failed'> {
  try {
    const permission =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';
    await subscribeToPush(vapidPublicKey, workerUrl);
    return 'granted';
  } catch {
    // Offline, push service hiccup, or a service worker that is not ready.
    return 'failed';
  }
}
