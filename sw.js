/* Minimal offline-first service worker for the Cadence kitchen timer.
   Caches the app shell so it keeps working if the kitchen wifi drops.
   Bump CACHE when shipping changes so clients pull the new version.
   (Renamed from the sezam-timers-* prefix on v25 — activate() deletes
   every cache that isn't the current one, so old caches self-clean.) */
const CACHE = 'cadence-timers-v25';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // App shell (same-origin): network-first so updates land, cache as offline fallback.
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(m => m || caches.match('./index.html')))
    );
    return;
  }
  // Cross-origin (Google Fonts): cache-first, fall back to network.
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    return res;
  }).catch(() => m)));
});
