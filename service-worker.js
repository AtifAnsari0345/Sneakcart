const CACHE_NAME = "sneakcart-cache-v3";
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/style.css",
  "/script.js",
  "/products/shoe1.png",
  "/products/shoe2.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install Event
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching all files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch Event (Cache with Network Fallback)
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          console.log(`[SW] Serving from cache: ${event.request.url}`);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache the new response if successful
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            // If both fail, show offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Sync Event
self.addEventListener('sync', event => {
  if (event.tag === 'sync-form') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      (async () => {
        // Simulate sync process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get all clients to show sync complete message
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'sync-complete',
            data: localStorage.getItem('syncData') || 'No data'
          });
        });
        
        console.log('[SW] Background sync completed');
      })()
    );
  }
});

// Push Event
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  if (data.method === 'pushMessage') {
    const title = data.title || '🛍️ SneakCart Update';
    const options = {
      body: data.message || 'New deals available!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Message Event (for communication from page)
self.addEventListener('message', event => {
  if (event.data && event.data.method === 'pushMessage') {
    self.registration.showNotification(
      event.data.title || '🛍️ SneakCart', 
      {
        body: event.data.message,
        icon: '/icons/icon-192.png'
      }
    );
  }
});