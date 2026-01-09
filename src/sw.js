// --------------------------
// Wahl-Info PWA Service Worker
// --------------------------

const CACHE_VERSION = "v3.0.0";
const APP_SHELL_CACHE = `app-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Basis-Assets (App Shell)
const APP_SHELL_URLS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",

  // Logo & Icons (Logo in SW integriert)
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon-192x192.png",
  "/icons/maskable-icon-512x512.png",

  // Splashscreen-Grafiken (werden dann zuverlässig offline vorgehalten)
  "/icons/splash-640x1136.png",
  "/icons/splash-750x1334.png",
  "/icons/splash-828x1792.png",
  "/icons/splash-1125x2436.png",
  "/icons/splash-1242x2208.png",
  "/icons/splash-1242x2688.png",
  "/icons/splash-1536x2048.png",
  "/icons/splash-1668x2224.png",
  "/icons/splash-1668x2388.png",
  "/icons/splash-2048x2732.png",
];
// --------------------------
// Request Type Check
// --------------------------

// Utility: HTTP-Request?
function isHttpRequest(request) {
  return (
    request.url.startsWith("http://") || request.url.startsWith("https://")
  );
}

// Utility: Unsere eigenen API-Calls?
function isApiRequest(request) {
  return (
    isHttpRequest(request) &&
    (request.url.includes("/parteien") ||
      request.url.includes("/politiker") ||
      request.url.includes("/wahltermine") ||
      request.url.includes("/wahllokale"))
  );
}

// --------------------------
// INSTALL
// --------------------------
self.addEventListener("install", (event) => {
  // App-Shell vorkacheln
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

// --------------------------
// ACTIVATE (Cache Cleanup)
// --------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key !== APP_SHELL_CACHE &&
                key !== RUNTIME_CACHE &&
                (key.startsWith("app-shell-") || key.startsWith("runtime-"))
            )
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// --------------------------
// FETCH ROUTING
// --------------------------

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!isHttpRequest(request) || request.method !== "GET") {
    return;
  }

  // 1) API: network-first, ohne Endlosschleifen
  if (isApiRequest(request)) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  // 2) HTML-Seiten (Navigation): App-Shell + Offline-Fallback
  if (request.mode === "navigate") {
    event.respondWith(appShellWithOfflineFallback(request));
    return;
  }

  // 3) Sonstige statische Assets: cache-first
  event.respondWith(staticAssetCacheFirst(request));
});

// --------------------------
// STRATEGIES
// --------------------------

async function appShellWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    // Optional: Navigations-Responses im Runtime-Cache speichern
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Offline: versuche Shell, sonst offline.html
    const cached = await caches.match(request);
    if (cached) return cached;

    const fallback = await caches.match("/offline.html");
    if (fallback) return fallback;

    // Letzter Notnagel
    return new Response("Offline – Daten nicht verfügbar", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staticAssetCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(APP_SHELL_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Asset weder im Cache noch im Netz – neutraler Fallback
    return new Response("", {
      status: 503,
    });
  }
}

async function networkFirstApi(request) {
  try {
    const networkResponse = await fetch(request);
    // Nur erfolgreiche Antworten cachen
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Offline: API nicht aus dem Cache bedienen (sonst „alte“ Live-Daten),
    // sondern ganz bewusst Fehler – dein api.ts zeigt dann "Offline – Daten nicht verfügbar"
    return new Response(
      JSON.stringify({
        error: "offline",
        message: "Offline – Daten nicht verfügbar.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }
}

// ------------------------------
// OPTIONAL: Message / Sync
// ------------------------------
self.addEventListener("message", (event) => {
  console.log("[SW] Received Message:", event.data);
});

self.addEventListener("push", (event) => {
  console.log("[SW] Push event received:", event);

  const data = event.data?.json() ?? {
    title: "Test Push",
    body: "Push vom Service Worker",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
    })
  );
});
