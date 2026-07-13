const APP_VERSION = '0.0.0.0.46';
const CACHE_NAME = `trip-app-cache-v${APP_VERSION}`;

// 監聽安裝事件
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// 監聽啟動事件
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// 監聽網路請求，讓 App 能夠正常載入
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
