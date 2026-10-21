/*
 * RoiQR service worker.
 *
 * The generator runs entirely client-side, so once the shell is cached the
 * page keeps working offline — matching the product promise. Static assets
 * are cache-first; the page itself is network-first with a cache fallback.
 */
const CACHE = "roiqr-v1";
const CORE = ["/", "/manifest.webmanifest", "/brand/logo.png", "/brand/logo-crop.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Live data only — never serve queued/generate responses from cache.
  if (url.pathname.startsWith("/api/")) return;

  // Immutable build assets: cache-first.
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname === "/manifest.webmanifest";
  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Pages: network-first, fall back to the cached shell when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/"))),
  );
});
