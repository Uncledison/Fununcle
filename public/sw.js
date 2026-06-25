// Service Worker — PWA 라우트별 설치 + 캐시
const CACHE_NAME = 'fun-uncle-v1';
const MANIFEST_CACHE = 'manifests-v2';

// 라우트별 전용 manifest (해당 페이지에서 설치하면 그 앱으로 설치됨)
const ROUTE_MANIFESTS = {
  '/english': '/manifest-english.json',
};

self.addEventListener('install', (event) => {
  // 설치 시점에 매니페스트들을 미리 캐시 (활성화 전이라 루프 없음)
  event.waitUntil(
    caches.open(MANIFEST_CACHE)
      .then((cache) => cache.addAll(['/manifest.json', ...Object.values(ROUTE_MANIFESTS)]))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // /manifest.json 요청 → 현재 페이지 경로에 맞는 전용 매니페스트 반환
  if (url.pathname === '/manifest.json') {
    event.respondWith((async () => {
      const client = event.clientId ? await self.clients.get(event.clientId) : null;
      let manifestKey = '/manifest.json';
      if (client) {
        const clientPath = new URL(client.url).pathname;
        for (const [route, manifest] of Object.entries(ROUTE_MANIFESTS)) {
          if (clientPath.startsWith(route)) { manifestKey = manifest; break; }
        }
      }
      const cache = await caches.open(MANIFEST_CACHE);
      return (await cache.match(manifestKey)) || (await cache.match('/manifest.json')) || fetch(event.request);
    })());
    return;
  }

  // 외부(CDN·Supabase)·비GET·/admin 은 건드리지 않음
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/admin')) return;

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
