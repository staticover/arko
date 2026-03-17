const CACHE = 'arko-v1';
const ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase.co') ||
      e.request.url.includes('fonts.googleapis.com') ||
      e.request.url.includes('cdn.jsdelivr.net') ||
      e.request.url.includes('cdnjs.cloudflare.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
