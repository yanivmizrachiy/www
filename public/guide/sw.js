const CACHE_PREFIX = 'moodle-guide-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const GUIDE_SHELL = [
  '/guide',
  '/guide-visual-isolation.css',
  '/guide/jerusalem-math-logo.webp',
  '/guide/screenshots/01-login.avif',
  '/guide/screenshots/02-my-courses-home.avif',
];

async function putIfUsable(cache, key, response) {
  if (response && response.ok) await cache.put(key, response.clone());
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(
        GUIDE_SHELL.map(async (url) => {
          const response = await fetch(url, { cache: 'reload' });
          await putIfUsable(cache, url, response);
        })
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/guide/release.json') return;

  const isGuideNavigation =
    request.mode === 'navigate' &&
    (url.pathname === '/guide' || url.pathname.startsWith('/guide/'));

  if (isGuideNavigation) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cacheKey = '/guide';
      const cached = await cache.match(cacheKey);

      const refresh = fetch(request)
        .then((response) => putIfUsable(cache, cacheKey, response))
        .catch(() => null);

      if (cached) {
        event.waitUntil(refresh);
        return cached;
      }

      const network = await refresh;
      return network || Response.error();
    })());
    return;
  }

  const isGuideAsset =
    url.pathname === '/guide-visual-isolation.css' ||
    url.pathname.startsWith('/guide/') ||
    url.pathname.startsWith('/assets/');

  if (!isGuideAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });

    const refresh = fetch(request)
      .then((response) => putIfUsable(cache, request, response))
      .catch(() => null);

    if (cached) {
      event.waitUntil(refresh);
      return cached;
    }

    const network = await refresh;
    return network || Response.error();
  })());
});
