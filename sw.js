const cacheVersion = 4;

var appCache = 'calendar-v'+cacheVersion;

var appFiles = [
  '/',
  '/index.html',

  '/icon/favicon.png',
  '/icon/touch-icon.png',
  '/icon/app-icon.svg',
  '/icon/app-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(appCache).then((cache) => {
      console.log('[Service Worker] Caching base app resources');
      return cache.addAll(appFiles);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      return r || fetch(e.request).then((response) => {
        return caches.open(appCache).then((cache) => {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activated');
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return parseInt(cacheName.substr(10)) < cacheVersion
        }).map(function(cacheName) {
          console.log('Deleting cache: '+cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});