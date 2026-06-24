const CACHE_NAME = 'fun-uncle-v1';
const MANIFEST_CACHE = 'manifests-v1';

// 라우트별 전용 manifest 매핑
const ROUTE_MANIFESTS = {
  '/english': '/manifest-english.json',
};

self.addEventListener('install', (event) => {
  // SW 설치 시점에 모든 manifest를 미리 캐시 (이 시점엔 SW가 아직 활성화 전이라 루프 없음)
  event.waitUntil(
    caches.open(MANIFEST_CACHE)
      .then(cache => cache.addAll(['/manifest.json', ...Object.values(ROUTE_MANIFESTS)]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // /manifest.json 요청을 가로채 현재 페이지 경로에 맞는 manifest 반환
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      (async () => {
        const client = event.clientId
          ? await self.clients.get(event.clientId)
          : null;

        let manifestKey = '/manifest.json';
        if (client) {
          const clientPath = new URL(client.url).pathname;
          for (const [route, manifest] of Object.entries(ROUTE_MANIFESTS)) {
            if (clientPath.startsWith(route)) {
              manifestKey = manifest;
              break;
            }
          }
        }

        const cache = await caches.open(MANIFEST_CACHE);
        return (await cache.match(manifestKey)) || (await cache.match('/manifest.json'));
      })()
    );
    return;
  }

  // 그 외 요청은 network-first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
