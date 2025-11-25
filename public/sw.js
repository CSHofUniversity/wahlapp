// --------------------------
// Wahl-Info PWA Service Worker
// --------------------------

const CACHE_VERSION = "v2.0.0";
const APP_CACHE = `app-cache-${CACHE_VERSION}`;

// Basis-Assets (App Shell)
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// --------------------------
// INSTALL
// --------------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Install");
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

// --------------------------
// ACTIVATE (Cache Cleanup)
// --------------------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate");
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_CACHE)
            .map((key) => caches.delete(key))
        )
      )
  );
});

// --------------------------
// FETCH ROUTING
// --------------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ---- External API (AWS API Gateway) → Network First + Cache fallback ----
  if (
    url.hostname.includes("execute-api") ||
    url.pathname.startsWith("/dev/parteien") ||
    url.pathname.startsWith("/dev/kandidaten") ||
    url.pathname.startsWith("/dev/wahltermine") ||
    url.pathname.startsWith("/dev/wahllokale") ||
    url.pathname.endsWith("/parteien") ||
    url.pathname.endsWith("/kandidaten") ||
    url.pathname.endsWith("/wahltermine") ||
    url.pathname.endsWith("/wahllokale")
  ) {
    event.respondWith(networkFirst(req));
    return;
  }

  // ---- Vite hashed assets (.js / .css / assets/*) → Cache First ----
  if (url.pathname.match(/\/assets\/.*\.(js|css|png|svg)$/)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // ---- Bilder & Icons ----
  if (req.destination === "image") {
    event.respondWith(cacheFirst(req));
    return;
  }

  // ---- SPA navigation fallback ----
  if (req.mode === "navigate") {
    event.respondWith(spaFallback());
    return;
  }
  // ---- Cache navigation marker icons ----
  if (url.pathname.startsWith("/navigation/") && req.destination === "image") {
    event.respondWith(cacheFirst(req));
    return;
  }

  // ---- Ignore OpenStreetMap tile requests offline ----
  if (
    url.hostname.includes("tile.openstreetmap.org") ||
    url.hostname.includes("a.tile.openstreetmap.org") ||
    url.hostname.includes("b.tile.openstreetmap.org") ||
    url.hostname.includes("c.tile.openstreetmap.org")
  ) {
    // errors unterdrücken
    event.respondWith(
      fetch(req).catch(() => new Response(null, { status: 200 }))
    );
    return;
  }

  // Default network
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

// --------------------------
// STRATEGIES
// --------------------------

async function cacheFirst(request) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    return cache.match(request);
  }
}

async function spaFallback() {
  const cache = await caches.open(APP_CACHE);
  return await cache.match("/index.html");
}

// ------------------------------
// OPTIONAL: Message / Sync
// ------------------------------
self.addEventListener("message", (event) => {
  console.log("[SW] Received Message:", event.data);
});
