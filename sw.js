var cacheName = 'calendar-v01';
var appFiles = [
  '/',
  '/index.html',
  '/icon/favicon.png',
  '/icon/touch-icon.png',
  '/icon/app-icon.svg',
  '/icon/app-icon.png',
  '/styles/style.css',
  '/scripts/jquery.min.js',
  '/i18n/jquery.i18n.js',
  '/i18n/jquery.i18n.messagestore.js',
  '/i18n/jquery.i18n.fallbacks.js',
  '/i18n/jquery.i18n.parser.js',
  '/i18n/jquery.i18n.emitter.js',
  '/scripts/conversion.min.js',
  '/scripts/computus.min.js',
  '/scripts/calendar.min.js',
  '/scripts/app.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('[Service Worker] Caching all: app content');
      return cache.addAll(appFiles);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then((response) => {
        return caches.open(cacheName).then((cache) => {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if(key !== cacheName) {
          console.log('[Service Worker] Clearing old cache(s)')
          return caches.delete(key);
        }
      }));
    })
  );
});