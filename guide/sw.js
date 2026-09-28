const CACHE_PREFIX = 'moodle-guide-';
const CANONICAL_URL = 'https://yanivmizrachiy.github.io/moodle-guide-presentation/';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key))
    );
    await self.clients.claim();
    await self.registration.unregister();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') return;
  const source = new URL(event.request.url);
  const target = new URL(CANONICAL_URL);
  target.search = source.search;
  event.respondWith(Response.redirect(target.toString(), 302));
});
