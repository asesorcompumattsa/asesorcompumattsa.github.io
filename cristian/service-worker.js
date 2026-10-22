const CACHE_NAME = "c-compumatt-v2";
const APP_SHELL = [
  "/cristian/v2.html",
  "/shared/style.css?v=20261002-13",
  "/shared/app.js?v=20261002-11",
  "/shared/logo-compumatt-transparent.png",
  "/shared/mascota_final.png",
  "/cristian/icon-192.png",
  "/cristian/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match("/cristian/v2.html"))));
});
