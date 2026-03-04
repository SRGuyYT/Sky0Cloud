self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// DO NOT cache anything (important for debugging + Matrix)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, {
      cache: "no-store"
    }).catch(() => {
      return new Response("Offline", {
        status: 503,
        statusText: "Offline"
      });
    })
  );
});
