const cacheVersion = 5;

var appCache = 'calendar-v'+cacheVersion;

var appFiles = [
  '/',
  '/index.html',

  '/manifest.webmanifest',
  '/icon/app-icon.png',
  '/icon/app-icon.svg',
  '/icon/favicon.png',
  '/icon/touch-icon.png',

  '/scripts/conversion.min.js',
  '/scripts/calendar.min.js',
  '/scripts/computus.min.js',
  '/scripts/app.min.js',

  '/scripts/jquery.min.js',

  '/i18n/jquery.i18n.js',
  '/i18n/jquery.i18n.emitter.js',
  '/i18n/jquery.i18n.fallbacks.js',
  '/i18n/jquery.i18n.messagestore.js',
  '/i18n/jquery.i18n.parser.js',

  '/i18n/languages/am-eth.json',
  '/i18n/languages/am-lat.json',
  '/i18n/languages/en.json',
  '/i18n/languages/fr.json',
  '/i18n/languages/gez-eth.json',
  '/i18n/languages/gez-lat.json',
  '/i18n/languages/om.json',
  '/i18n/languages/pl.json',
  '/i18n/languages/ti-eth.json',
  '/i18n/languages/ti-lat.json',

  '/styles/style.css',
  '/styles/notosans/NotoSansEthiopic-Bold.woff2',
  '/styles/notosans/NotoSansEthiopic.woff2',
  '/styles/notosans/notosans.min.css',
  '/styles/octicons/octicons.min.css',
  '/styles/octicons/octicons.woff2?ef21c39f0ca9b1b5116e5eb7ac5eabe6'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(appCache).then((cache) => {
      console.log('[Service Worker] Installing new cache: '+appCache);
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
          console.log('[Service Worker] Deleting cache: '+cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});