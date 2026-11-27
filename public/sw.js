const CACHE_NAME = 'gta6takip-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Canlı API ve sayfa verilerini asla önbellekleme; sadece tarayıcı PWA kurulum kriterini karşıla
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});
