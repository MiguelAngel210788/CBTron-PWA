'use strict';

const CBTRON_PWA_LEGACY_CACHE_PREFIX = 'cbtron-pwa-';
// Solo se guardan archivos públicos y estáticos de este mismo sitio (la carcasa y los juegos de misiones).
// Nunca se guardan la aplicación de Apps Script, sesiones, tokens ni respuestas del backend.
const SHELL_CACHE = 'cbtron-shell-v1';
const GAMES_CACHE = 'cbtron-games-v1';
const SHELL_FILES = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const NETWORK_TIMEOUT_MS = 6000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
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

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
  });
}

// Carcasa: siempre se intenta la red primero (una publicación nueva se ve al instante). Si la red de datos
// tarda o falla al abrir la app, se usa la última copia de la carcasa en lugar de la pantalla de "sin internet";
// la aplicación dentro del marco se vuelve a pedir en cuanto hay conexión.
async function shellResponse(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await withTimeout(fetch(request, { cache: 'no-store' }), NETWORK_TIMEOUT_MS);
    if (response && response.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true }) || await cache.match('./index.html') || await cache.match('./');
    if (cached) return cached;
    throw error;
  }
}

// Juegos de misiones: cada archivo lleva ?v=<versión>; una versión guardada no cambia, así que se sirve
// desde la caché y solo se descarga la primera vez o cuando se publica una versión nueva.
async function gameResponse(request) {
  const cache = await caches.open(GAMES_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const url = new URL(request.url);
    const stale = await cache.keys();
    await Promise.all(stale.filter((entry) => {
      const old = new URL(entry.url);
      return old.pathname === url.pathname && old.search !== url.search;
    }).map((entry) => cache.delete(entry)));
    cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (!request || request.method !== 'GET') return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (requestUrl.pathname.indexOf('/games/') !== -1) {
    event.respondWith(gameResponse(request));
    return;
  }
  if (request.mode === 'navigate') event.respondWith(shellResponse(request));
});
