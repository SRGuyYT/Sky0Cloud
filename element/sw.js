/* Sky0Cloud service worker: keep app shell fresh and avoid stale config. */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isConfig = url.pathname === '/config.json' || /\/config\..+\.json$/.test(url.pathname);
  if (!isConfig) return;

  event.respondWith(
    fetch(request, { cache: 'no-store' }).catch(() => caches.match(request))
  );
});
