/**
 * Subway Runner 3D — Service Worker (V5.4)
 *
 * Strategy:
 * - Precache: app shell (index.html, manifest, icons, privacy, css)
 * - Runtime cache-first: immutable assets (models/, sounds/, CDN libs)
 * - Runtime network-first: js/ modules (game logic changes often)
 *
 * Bump CACHE_VERSION on every deploy that changes cached files —
 * old caches are deleted on activate.
 */
const CACHE_VERSION = 'subwayrunner-v5.4.0';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_ASSETS = [
  './index.html',
  './manifest.webmanifest',
  './privacy.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './css/gesture-overlay.css',
  './css/gesture-config.css',
];

// Hosts whose responses are safe to cache long-term (versioned URLs)
const IMMUTABLE_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isImmutableCdn = IMMUTABLE_HOSTS.includes(url.hostname);
  const isMediaAsset = url.origin === self.location.origin &&
    (url.pathname.includes('/models/') || url.pathname.includes('/sounds/') || url.pathname.includes('/icons/'));

  // Navigation: network first, fall back to cached shell (offline start)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Immutable assets: cache first
  if (isImmutableCdn || isMediaAsset) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
      )
    );
    return;
  }

  // Everything else same-origin (js/, css/): network first with cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
