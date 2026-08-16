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
  const raw = event.notification.data?.url || '/';
  // Payload urls are site-relative ('/checkout/'), but client.url is always
  // absolute. Comparing the two directly never matched, so the reuse branch
  // below was dead and every tap opened a duplicate tab.
  const target = new URL(raw, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Already looking at the page the notification points at: just focus it.
      for (const client of clients) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      // Otherwise reuse a tab already on the site rather than stacking another
      // one — someone tapping a cart reminder should land on their basket, not
      // acquire a third copy of the menu.
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && 'navigate' in client) {
          return client.navigate(target).then((c) => (c && 'focus' in c ? c.focus() : undefined));
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    }),
  );
});
