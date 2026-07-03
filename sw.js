// ===== SERVICE WORKER =====
// Monster Merge Quest — オフライン対応

// 更新のたびにこのバージョンを上げると、古いキャッシュが確実に破棄されます
const CACHE_NAME = 'monster-merge-v2';

// キャッシュするファイル一覧（実際にリポジトリ直下にあるファイル名に一致させること）
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
  './monster-slime.png',
  './monster-bat.png',
  './monster-pixie.png',
  './monster-skeleton.png',
  './monster-centaur.png',
  './monster-minotaur.png',
  './monster-witch.png',
  './monster-dragon.png',
  './monster-demonlord.png',
];

// ===== インストール: ファイルをキャッシュ =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // addAllは1つでも404だと全滅するため、1つずつ個別に取得し
      // 失敗したファイルがあってもインストール自体は継続させる
      const results = await Promise.allSettled(
        ASSETS.map((url) => cache.add(url))
      );
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn('⚠️ キャッシュ失敗:', ASSETS[i], r.reason);
        }
      });
    })
  );
  self.skipWaiting();
});

// ===== アクティベート: 古いキャッシュを削除し、即座に全クライアントを制御 =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
     .then(() => {
       // 新しいSWが有効化されたことを開いている画面に知らせ、リロードを促す
       return self.clients.matchAll({ type: 'window' }).then((clients) => {
         clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED' }));
       });
     })
  );
});

// ===== フェッチ =====
// HTML/CSS/JS は「ネットワーク優先」にして更新をすぐ反映し、
// 取得できない場合のみキャッシュ（オフライン対応）にフォールバックする。
// 画像などの静的アセットは従来通りキャッシュ優先で高速表示。
const NETWORK_FIRST_EXT = ['.html', '.css', '.js'];

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Firebase などの外部APIはキャッシュしない
  if (url.includes('firestore.googleapis.com') || url.includes('firebase')) {
    return;
  }

  const isNetworkFirst =
    NETWORK_FIRST_EXT.some((ext) => url.endsWith(ext)) ||
    event.request.mode === 'navigate';

  if (isNetworkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // それ以外（画像等）はキャッシュ優先
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      });
    })
  );
});
