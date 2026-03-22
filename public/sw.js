const CACHE_NAME = 'weatherlywave-v5.0.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/js/utils/dateFormatter.js',
  '/js/utils/unitConverter.js',
  '/js/utils/domHelpers.js',
  '/js/api/openweather.js',
  '/js/api/tomorrowio.js',
  '/js/core/weatherEngine.js',
  '/js/core/weatherAlerts.js',
  '/js/core/performanceManager.js',
  '/js/search/SearchManager.js',
  '/js/settings/SettingsManager.js',
  '/js/ui/loaderUI.js',
  '/js/ui/headerUI.js',
  '/js/ui/currentUI.js',
  '/js/ui/forecastUI.js',
  '/js/ui/hourlyUI.js',
  '/js/ui/solarUI.js',
  '/js/ui/kpiUI.js',
  '/js/ui/alertsUI.js',
  '/js/core/app.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache add failed', err))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request)
          .then(response => {
            // Cache new requests that are successful and from our origin
            if (response && response.status === 200 && 
                event.request.url.startsWith(self.location.origin)) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline - Weather data unavailable', {
              status: 503,
              statusText: 'Offline'
            });
          });
      })
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );

  // Notify all clients about the new version
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NEW_VERSION',
          version: CACHE_NAME.replace('weatherlywave-', '')
        });
      });
    })
  );

  self.clients.claim();
});