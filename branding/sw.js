/* global self, clients */

const STATIC_CACHE = 'sky0cloud-static-v4';
const STATIC_ASSETS = [
  '/',
  '/home.html',
  '/home-style.css?v=2',
  '/home.js?v=2',
  '/manifest.json',
  '/logo.png?v=2',
  '/apple-touch-icon.png?v=2',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(STATIC_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isMatrixApi(url) {
  return url.pathname.startsWith('/_matrix/') || url.pathname.startsWith('/_synapse/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isMatrixApi(url)) {
    // Never cache Matrix traffic; keep sync/push fully real-time.
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(event.request, { ignoreSearch: false });

    const networkFetch = fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(() => cached);

    return cached || networkFetch;
  })());
});

function parsePayload(data) {
  if (!data) return {};
  try {
    return data.json();
  } catch (_) {
    return { body: data.text() };
  }
}

function normalizeRoute(route) {
  if (!route || typeof route !== 'string') return '/#/home';
  if (route.startsWith('/#/')) return route;
  if (route.startsWith('#/')) return `/${route}`;
  if (route.startsWith('/')) return route;
  return `/#/${route.replace(/^#?\/?/, '')}`;
}

self.addEventListener('push', (event) => {
  const payload = parsePayload(event.data);
  const title = payload.title || payload.sender_display_name || 'Sky0Cloud';
  const body = payload.body || payload.content?.body || 'You have a new message.';
  const route = normalizeRoute(payload.route || payload.url || '/#/home');

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/logo.png?v=2',
    badge: '/apple-touch-icon.png?v=2',
    tag: payload.tag || `sky0cloud-${Date.now()}`,
    renotify: false,
    data: { route },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = normalizeRoute(event.notification.data?.route || '/#/home');

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      const u = new URL(client.url);
      if (u.origin !== self.location.origin) continue;
      await client.focus();
      if ('navigate' in client) {
        await client.navigate(route);
      }
      return;
    }

    await clients.openWindow(route);
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
