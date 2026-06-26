// Service Worker — PWA 라우트별 설치 + 캐시
// 매니페스트는 index.html에서 경로별로 직접 지정(clientId 가로채기 제거 — 모바일 안정)
const CACHE_NAME = 'fun-uncle-v1';
const MANIFEST_CACHE = 'manifests-v3';

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

  // 매니페스트는 가로채지 않음 — 브라우저가 경로별 링크(/manifest.json 또는
  // /manifest-english.json)를 직접 받아 해당 PWA로 설치 (모바일에서 안정적)

  // 외부(CDN·Supabase)·비GET·/admin 은 건드리지 않음
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/admin')) return;

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
