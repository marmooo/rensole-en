var CACHE_NAME = "2023-07-28 08:00";
var urlsToCache = [
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

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
