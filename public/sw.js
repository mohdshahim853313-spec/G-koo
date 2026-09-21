const CACHE_NAME = 'g-koo-v5';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/gkoo-logo.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/screenshot-desktop.png',
  '/gkoo-widget-template.json',
  '/gkoo-widget-data.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // 1. Navigation requests (HTML) -> Network First with cache fallback for offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. Static hashed Vite assets (/assets/...) -> Cache first, network fallback (NEVER return HTML on fail)
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Other static assets -> Cache first, then network
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// Windows 11 PWA Widget Handler
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(
    (async () => {
      if (self.widgets) {
        await self.widgets.updateByTag('gkoo-daily-widget', {
          template: JSON.stringify(await (await fetch('/gkoo-widget-template.json')).json()),
          data: JSON.stringify(await (await fetch('/gkoo-widget-data.json')).json())
        });
      }
    })()
  );
});

self.addEventListener('widgetclick', (event) => {
  event.waitUntil(
    self.clients.openWindow(event.widgetAction?.url || '/quiz/daily?daily=true')
  );
});
