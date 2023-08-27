const CACHE_NAME = "2023-08-27 18:50";
const urlsToCache = [
  "/rensole-en/",
  "/rensole-en/index.js",
  "/rensole-en/pronounce.tsv",
  "/rensole-en/sql.js-httpvfs/sql-wasm.wasm",
  "/rensole-en/sql.js-httpvfs/sqlite.worker.js",
  "/rensole-en/mp3/incorrect1.mp3",
  "/rensole-en/mp3/correct3.mp3",
  "/rensole-en/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
