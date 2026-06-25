// Minimal Service Worker for PWA compliance
const CACHE_NAME = 'fun-uncle-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    // 같은 출처 GET만 처리. 크로스도메인(CDN·Supabase API 등)·비GET은 건드리지 않음.
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
    // admin/콜백 등은 항상 네트워크 직행 (캐시 간섭 방지)
    if (url.pathname.startsWith('/admin')) return;
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
