/*
 * RootIn service worker.
 *
 * Caching is deliberately conservative:
 * - navigation requests stay network-first and are never stored, because pages
 *   can contain authenticated, user-specific data;
 * - API requests are never intercepted or cached;
 * - only same-origin static assets are cached, and the runtime cache is bounded;
 * - a static offline page is precached and used when a navigation fails.
 */

const CACHE_VERSION = "rootin-v1";
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = "/offline";
const RUNTIME_CACHE_LIMIT = 80;

const CORE_ASSETS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const core = await caches.open(CORE_CACHE);

      await Promise.allSettled(
        CORE_ASSETS.map((url) => core.add(new Request(url, { cache: "reload" })))
      );

      // Fetch the offline document and every build asset it references so the
      // fallback still renders with the site's styles when the network is down.
      const response = await fetch(OFFLINE_URL, { cache: "reload" });
      if (!response.ok) {
        throw new Error(`Unable to precache ${OFFLINE_URL}: ${response.status}`);
      }

      await core.put(OFFLINE_URL, response.clone());

      const html = await response.text();
      const assets = new Set();
      const assetPattern = /(?:href|src)="(\/_next\/static\/[^"]+)"/g;
      let match;
      while ((match = assetPattern.exec(html)) !== null) {
        assets.add(match[1]);
      }

      await Promise.allSettled([...assets].map((url) => core.add(url)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("rootin-") && key !== CORE_CACHE && key !== RUNTIME_CACHE
          )
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API traffic; responses may be private and must stay fresh.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(cacheFirst(request, event));
  }
});

async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const core = await caches.open(CORE_CACHE);
    const offline = await core.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response("You are offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

function isCacheableAsset(url) {
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/avatars/")
  ) {
    return true;
  }

  return /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|webp|avif|gif|svg|ico)$/i.test(
    url.pathname
  );
}

async function cacheFirst(request, event) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      event.waitUntil(
        (async () => {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(request, response.clone());
          await trimRuntimeCache(cache);
        })()
      );
    }
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function trimRuntimeCache(cache) {
  const keys = await cache.keys();
  const excess = keys.length - RUNTIME_CACHE_LIMIT;
  if (excess <= 0) return;

  await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
}
