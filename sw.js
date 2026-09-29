'use strict';
// CBTron se mudó a https://cbtron-507a1.web.app/. Este service worker borra sus copias y se retira.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).then(() => self.registration.unregister()));
});
