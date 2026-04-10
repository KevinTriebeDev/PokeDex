const CACHE_NAME = "pokedex-v1";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./css/standart.css",
  "./css/backround.css",
  "./css/styles.css",
  "./script/db.js",
  "./script/template.js",
  "./script/app-core.js",
  "./script/dialog-content.js",
  "./script/dialog-navigation.js",
  "./script/pokemon-data-search.js",
  "./script/events.js",
  "./asstes/img/favicon.png",
  "./asstes/img/start-logo.png",
  "./asstes/img/pokemon-pokeball.gif",
  "./manifest.json",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for API calls
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Network-first for PokeAPI requests
  if (
    url.hostname === "pokeapi.co" ||
    url.hostname === "raw.githubusercontent.com"
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
