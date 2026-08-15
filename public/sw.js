/**
 * Minimal service worker — Phase 2 (PWA). Its only job right now is to make
 * the site installable (Chrome requires a `fetch` handler for that) and give
 * a basic offline fallback. No push handling here — that's Phase 3's `push`
 * event listener, added once VAPID subscriptions exist.
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
