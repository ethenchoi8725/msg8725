// 매출장부 서비스워커 — 항상 최신 파일을 먼저 받아오고(네트워크 우선), 인터넷이 끊겼을 때만 저장본을 보여줌
const CACHE = 'msg8725-v56';
const CORE = ['./', './index.html', './manifest.webmanifest', './manifest-pp.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png', './icon-pp-192.png', './icon-pp-512.png', './apple-touch-icon-pp.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Firebase 등 외부 요청은 건드리지 않음
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
