// Service worker — Site Roteiro Sudeste Asiático 2026 (modo offline)
const CACHE = 'asia2026-v1';
const PAGE = './Site%20Roteiro%20Sudeste%20Asi%C3%A1tico%202026.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([PAGE])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('asia2026') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Navegação para a página: cache primeiro, rede como fallback/atualização
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(hit => {
        const net = fetch(e.request).then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(() => hit || caches.match(PAGE));
        return hit || net;
      })
    );
    return;
  }

  // Recursos (Leaflet CDN, tiles Esri): cache-first com atualização em segundo plano
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
