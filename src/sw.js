const cacheName = "2025-12-31 00:00";
const urlsToCache = [
  "/rensole-en/index.js",
  "/rensole-en/pronounce.tsv",
  "/rensole-en/sql.js-httpvfs/sql-wasm.wasm",
  "/rensole-en/sql.js-httpvfs/sqlite.worker.js",
  "/rensole-en/mp3/incorrect1.mp3",
  "/rensole-en/mp3/correct3.mp3",
  "/rensole-en/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((err) => console.warn("Failed to cache", url, err))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
