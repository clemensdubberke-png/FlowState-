// Blitzeblank service worker: network-first for HTML, cache-first for static assets.
const CACHE_VERSION = 'blitzeblank-v6';
const PRECACHE_URLS = [
  './', './index.html', './manifest.json', './css/app.css',
  './js/app.js', './js/art.js', './js/logic.js', './js/router.js', './js/store.js', './js/sync.js',
  './js/templates.js', './js/ui.js', './js/views-edit.js', './js/views-kids.js', './js/views-main.js',
  './js/views-settings.js', './js/views-timer.js', './js/lines.js', './js/mascot.js', './js/views-intensity.js', './js/condition.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(PRECACHE_URLS)).catch(() => {}));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Firebase, fonts etc. go straight to the network

  if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(networkFirst(req));
    return;
  }
  // JS/CSS: network-first too, so app updates arrive immediately; offline falls back to cache
  if (/\.(js|css|json)$/.test(url.pathname)) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(cacheFirst(req));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    return (await caches.match(request, { ignoreSearch: true })) ||
      (request.mode === 'navigate' ? await caches.match('./index.html') : null) ||
      new Response('<h1>Offline</h1><p>Keine Internetverbindung.</p>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    return new Response('', { status: 503 });
  }
}
