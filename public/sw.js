/**
 * Service worker. Phase 2 made the site installable (a `fetch` handler is
 * what Chrome requires for that) with a basic offline fallback. Phase 3 adds
 * receiving a push message and reacting to a tap on it — nothing sends one
 * yet, that's Phase 4's campaign-send endpoint. The payload contract below
 * ({title, body, url}) is this file's half of that future contract; keep
 * Phase 4's Worker code in sync with it rather than the other way round.
 */
const CACHE = 'ovenvibe-shell-v1';
const SHELL = ['/', '/manifest.webmanifest', '/favicon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network-first: the site changes often (menu, prices), so a stale cached
// page is worse than a live one. The cache only exists to keep the shell
// reachable when there is no network at all.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/'))),
  );
});

// Payload is JSON: { title, body, url }. `url` is where a tap lands —
// defaults to the homepage if the campaign didn't set one.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'The Oven Vibe', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'The Oven Vibe';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus an already-open tab on the same page rather than stacking a
      // second one — a customer tapping a deal alert on a device that
      // already has the site open should land where they were, not spawn
      // a duplicate tab.
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
