const CACHE_NAME = 'my-trip-pwa-cache-v0.0.0.0.48';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png'
];

// 安裝事件：預先快取基本靜態資源
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 啟動事件：清除舊版本的快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截 Fetch 事件：使用「網路優先，快取備用 (Network First)」策略
self.addEventListener('fetch', event => {
  // 僅攔截 GET 請求，忽略 Firebase POST 等請求與擴充套件請求
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 動態將取得的最新靜態資源更新至快取
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          // 避免跨域請求 (如 Google API) 導致快取污染，僅快取成功狀態
          if (response.status === 200) {
            cache.put(event.request, clonedResponse);
          }
        });
        return response;
      })
      .catch(() => {
        // 若斷網或 API 請求失敗，退回尋找快取資料
        return caches.match(event.request);
      })
  );
});
