const CACHE_NAME = 'workout-app-v4';

// List of core static assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  // Exercise GIF animations pre-cache
  '/exercises/Back_Extension.gif',
  '/exercises/Barbell_Squat.gif',
  '/exercises/Bent_Over_Dumbbell_Row.gif',
  '/exercises/Bent_Over_Rear_Delt_Fly.gif',
  '/exercises/Cable_Bicep_Curl.gif',
  '/exercises/Cable_Front_Raise.gif',
  '/exercises/Chest_Fly.gif',
  '/exercises/Crunch.gif',
  '/exercises/Dumbbell_Bench_Press.gif',
  '/exercises/Dumbbell_Bicep_Curl.gif',
  '/exercises/Dumbbell_Hammer_Curl.gif',
  '/exercises/Dumbbell_Pullover.gif',
  '/exercises/Dumbbell_Shoulder_Press.gif',
  '/exercises/EZ_Bar_Preacher_Curl.gif',
  '/exercises/Incline_Chest_Press.gif',
  '/exercises/Incline_Dumbbell_Fly.gif',
  '/exercises/Incline_Dumbbell_Press.gif',
  '/exercises/Lat_Pulldown.gif',
  '/exercises/Leg_Extension.gif',
  '/exercises/Lying_Leg_Curl.gif',
  '/exercises/Lying_Triceps_Extension.gif',
  '/exercises/Machine_Shoulder_Press.gif',
  '/exercises/Reverse_Grip_Lat_Pulldown.gif',
  '/exercises/Seated_Calf_Raise.gif',
  '/exercises/Triceps_Pushdown.gif',
  '/exercises/V_Bar_Triceps_Pushdown.gif'
];

// Helper to check if request is for media or static code assets
function isStaticAsset(url, request) {
  const path = url.pathname.toLowerCase();
  const destination = request.destination;
  return (
    destination === 'script' ||
    destination === 'style' ||
    destination === 'font' ||
    destination === 'image' ||
    destination === 'video' ||
    path.startsWith('/assets/') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.gif') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.webp') ||
    path.endsWith('.woff2') ||
    path.endsWith('.svg') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('githubusercontent.com')
  );
}

// Install Event: Cache essential app shell & exercise animations immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching static assets and exercise GIFs...');
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (err) {
        console.warn('[SW] Pre-cache addAll failed, caching individually:', err);
        for (const asset of STATIC_ASSETS) {
          try {
            await cache.add(asset);
          } catch (e) {
            console.warn('[SW] Could not cache:', asset, e);
          }
        }
      }
    })
  );
});

// Activate Event: Delete old caches and take control of all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Instant Offline Navigation + Aggressive Asset Caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  // Bypass Vite internal dev requests & source files to prevent stale dev module caching
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@id') ||
    url.pathname.startsWith('/@fs') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.search.includes('import') ||
    url.search.includes('t=')
  ) {
    return;
  }

  // 1. API routes handling (Network First with fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, message: 'شما در حالت آفلاین هستید.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // 2. Navigation Request (Opening the App / Page Load)
  // INSTANT LOAD: Always return cached index.html FIRST if available so the app boots in 0ms offline!
  const isNavigation = event.request.mode === 'navigate' ||
                       (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(
      caches.match('/index.html').then((cachedHtml) => {
        // Fetch network update in background silently if online
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const resToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', resToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            /* Offline, network failed, ignore error */
          });

        // If we have cached HTML, return it IMMEDIATELY (no delay/hang on Iranian networks)
        if (cachedHtml) {
          return cachedHtml;
        }

        // Otherwise wait for network fetch
        return networkFetch.then((res) => res || new Response('آفلاین - برنامه‌ای یافت نشد', { status: 503 }));
      })
    );
    return;
  }

  // 3. Static Assets & Media (JS, CSS, Fonts, Images, GIFs)
  if (isStaticAsset(url, event.request)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from local cache instantly, attempt background update if connected
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {/* Offline */});
          return cachedResponse;
        }

        // Fetch from network and save to local cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[SW] Asset fetch failed offline:', event.request.url, err);
            return new Response('', { status: 503, statusText: 'Offline Asset Unavailable' });
          });
      })
    );
    return;
  }

  // 4. Default fallback: Cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((networkRes) => {
        if (networkRes && networkRes.ok) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkRes;
      });
    }).catch(() => {
      return new Response('آفلاین', { status: 503 });
    })
  );
});
