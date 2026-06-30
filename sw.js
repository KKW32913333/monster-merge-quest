// ===== SERVICE WORKER =====
// Monster Merge Quest — オフライン対応

const CACHE_NAME = 'monster-merge-v2';

// キャッシュするファイル一覧
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './firebase.js',
  './manifest.json',
  './icon-58.png',
  './icon-80.png',
  './icon-87.png',
  './icon-120.png',
  './icon-180.png',
  './icon-1024.png',
  'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js',
];

// ===== インストール: ファイルをキャッシュ =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ===== アクティベート: 古いキャッシュを削除 =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===== フェッチ: キャッシュ優先 =====
self.addEventListener('fetch', (event) => {
  // Firebase などの外部APIはキャッシュしない
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => {
        // オフライン時はindex.htmlを返す
        return caches.match('./index.html');
      });
    })
  );
});
