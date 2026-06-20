const CACHE = 'flow-v1';
const RUNTIME = 'flow-runtime';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k !== RUNTIME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('chrome-extension') || req.url.includes('localhost')) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  e.respondWith((async () => {
    try {
      const net = await fetch(req);
      const cache = await caches.open(RUNTIME);
      cache.put(req, net.clone());
      return net;
    } catch {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fallback = await caches.match('./index.html');
      if (fallback && req.headers.get('Accept')?.includes('text/html')) return fallback;
      return new Response('Offline', { status: 503 });
    }
  })());
});
