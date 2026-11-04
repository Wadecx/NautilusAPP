// Service worker du festival Nautilus : rend l'application web consultable hors connexion.
// Pensez à incrémenter VERSION à chaque mise à jour du programme pour forcer le rafraîchissement.
const VERSION = 'nautilus-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(VERSION).then((cache) => cache.add('/').catch(() => {})));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La page envoie la liste des pages et des fichiers à mettre en cache dès la première visite.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS') return;
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      Promise.all(
        event.data.urls.map((url) =>
          cache.match(url).then((hit) => hit || cache.add(url).catch(() => {}))
        )
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Pages : le réseau d'abord (programme à jour), le cache si l'on est hors connexion.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
            .then((hit) => hit || caches.match('/'))
        )
    );
    return;
  }

  // Scripts, polices, images : le cache d'abord (les fichiers du bundle sont versionnés).
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
