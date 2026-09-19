'use strict';

const CBTRON_PWA_LEGACY_CACHE_PREFIX = 'cbtron-pwa-';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.indexOf(CBTRON_PWA_LEGACY_CACHE_PREFIX) === 0)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Nunca guardamos la sesión ni respuestas del backend. La carcasa siempre
// solicita navegaciones nuevas para que una publicación reciente sea visible.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (!request || request.method !== 'GET' || request.mode !== 'navigate') return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;
  event.respondWith(fetch(request, { cache: 'no-store' }));
});
