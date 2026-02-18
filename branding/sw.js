const CACHE_NAME = 'sky0cloud-shell-v3';
const OFFLINE_FALLBACK_URL = '/welcome.html';
const DEFAULT_TARGET_URL = '/#/home';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([OFFLINE_FALLBACK_URL, '/welcome-style.css', '/logo.png']);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isHtmlNavigation = event.request.mode === 'navigate';
  const sameOrigin = requestUrl.origin === self.location.origin;

  if (isHtmlNavigation && sameOrigin) {
    event.respondWith((async () => {
      try {
        return await fetch(event.request);
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match(OFFLINE_FALLBACK_URL);
        return fallback || Response.error();
      }
    })());
  }
});

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let payload = {};
    try {
      payload = event.data ? event.data.json() : {};
    } catch (_) {
      const text = event.data ? event.data.text() : '';
      payload = { body: text };
    }

    const title = payload.title || payload.sender_display_name || 'Sky0Cloud';
    const body = payload.body || payload.content?.body || 'You have a new message';
    const unread = Number(payload.unread ?? payload.counts?.unread ?? 0);
    const targetUrl = payload.url || payload.click_action || DEFAULT_TARGET_URL;

    if ('setAppBadge' in self.registration) {
      try {
        await self.registration.setAppBadge(Math.max(0, Number.isFinite(unread) ? unread : 0));
      } catch (_) {
        // ignored on unsupported platforms
      }
    }

    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_BADGE',
        payload: { unread },
      });
    }

    await self.registration.showNotification(title, {
      body,
      icon: '/logo.png',
      badge: '/apple-touch-icon.png',
      tag: payload.tag || payload.room_id || 'matrix-message',
      renotify: true,
      data: {
        url: targetUrl,
      },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const target = event.notification?.data?.url || DEFAULT_TARGET_URL;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of windows) {
      const clientUrl = new URL(client.url);
      const targetUrl = new URL(target, self.location.origin);

      if (clientUrl.origin === targetUrl.origin) {
        await client.focus();
        client.navigate(targetUrl.href);
        return;
      }
    }

    await self.clients.openWindow(target);
  })());
});

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data.type === 'SYNC_BADGE') {
    const count = Number(event.data.count || 0);
    if ('setAppBadge' in self.registration) {
      if (count > 0) {
        self.registration.setAppBadge(count).catch(() => {});
      } else if ('clearAppBadge' in self.registration) {
        self.registration.clearAppBadge().catch(() => {});
      }
    }
  }
});
