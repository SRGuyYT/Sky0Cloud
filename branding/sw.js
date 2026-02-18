/* global self, clients, registration, navigator */

const CACHE_NAME = 'sky0cloud-runtime-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function parsePushPayload(data) {
  if (!data) return {};

  try {
    return data.json();
  } catch (_) {
    try {
      return { body: data.text() };
    } catch (_) {
      return {};
    }
  }
}

function normalizeRoute(rawRoute) {
  if (!rawRoute || typeof rawRoute !== 'string') return '/#/home';
  if (rawRoute.startsWith('/#/')) return rawRoute;
  if (rawRoute.startsWith('#/')) return `/${rawRoute}`;
  if (rawRoute.startsWith('/')) return rawRoute;
  return `/#/${rawRoute.replace(/^#?\/?/, '')}`;
}

async function syncBadge(count) {
  if (!('setAppBadge' in navigator) || !('clearAppBadge' in navigator)) return;

  const numericCount = Number(count) || 0;
  try {
    if (numericCount > 0) {
      await navigator.setAppBadge(numericCount);
    } else {
      await navigator.clearAppBadge();
    }
  } catch (_) {
    // Best-effort only.
  }
}

self.addEventListener('push', (event) => {
  const payload = parsePushPayload(event.data);
  const title = payload.title || payload.sender_display_name || 'Sky0Cloud';
  const body = payload.body || payload.content?.body || 'You have a new message.';
  const route = normalizeRoute(payload.route || payload.url || '/#/home');
  const unreadCount = Number(payload.unread_count ?? payload.badge ?? 0) || 0;

  event.waitUntil((async () => {
    await syncBadge(unreadCount);

    await self.registration.showNotification(title, {
      body,
      icon: '/logo.png',
      badge: '/apple-touch-icon.png',
      tag: payload.tag || `mx-${Date.now()}`,
      renotify: false,
      requireInteraction: false,
      data: {
        route,
      },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = normalizeRoute(event.notification.data?.route || '/#/home');

  event.waitUntil((async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of clientList) {
      const url = new URL(client.url);
      if (url.origin !== self.location.origin) continue;

      const focused = await client.focus();
      await focused.navigate(route);
      return;
    }

    await clients.openWindow(route);
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'SET_BADGE') {
    event.waitUntil(syncBadge(data.count));
    return;
  }

  if (data.type === 'CLEAR_BADGE') {
    event.waitUntil(syncBadge(0));
  }
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' });
    }
  })());
});
