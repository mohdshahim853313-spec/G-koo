const CACHE_NAME = 'g-koo-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/gkoo-logo.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/gkoo-widget-template.json',
  '/gkoo-widget-data.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match('/')))
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
