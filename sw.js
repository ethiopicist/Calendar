const appVersion = 0.7;

var appCache = 'calendar-v'+appVersion;

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

  '/i18n/languages/en.json',
  '/i18n/languages/gez-eth.json',
  
  '/scripts/conversion.min.js',
  '/scripts/computus.min.js',
  '/scripts/calendar.min.js',
  '/scripts/app.min.js'
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
      console.log('[Service Worker] Fetching resource: '+e.request.url);
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
        cacheNames.map(function(cacheName) {
          if(parseInt(cacheName.substr(9, 3)) < appVersion) {
            console.log('[Service Worker] Deleting old cache: '+cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});