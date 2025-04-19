// Cache names
const CACHE_NAME = 'sneakcart-v1';
const STATIC_CACHE = 'sneakcart-static-v1';
const DYNAMIC_CACHE = 'sneakcart-dynamic-v1';

// Assets to cache
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'cart.html',
  'login.html',
  'offline.html',
  'style.css',
  'script.js',
  'manifest.json',
  'favicon.ico',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'products/shoe1.png',
  'products/shoe2.jpg',
  'products/shoe3.jpg',
  'products/shoe4.jpg',
  'products/shoe5.jpg',
  'products/shoe6.jpg',
  'products/shoe7.jpg',
  'products/shoe8.jpg',
  'products/shoe9.jpg',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(ASSETS_TO_CACHE)
          .catch(error => {
            console.error('Failed to cache all resources:', error);
            // Continue with installation even if some assets fail to cache
            return Promise.resolve();
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Helper function to limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [STATIC_CACHE, CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network with improved strategy
self.addEventListener('fetch', event => {
  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, serve the offline page
          return caches.match('offline.html');
        })
    );
    return; // Exit early for navigation requests
  }
  
  // Handle all other requests
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('fonts.googleapis.com') || 
      event.request.url.includes('cdnjs.cloudflare.com')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update cache in background for non-API requests
            if (!event.request.url.includes('/api/')) {
              fetch(event.request)
                .then(freshResponse => {
                  if (freshResponse && freshResponse.status === 200) {
                    caches.open(CACHE_NAME)
                      .then(cache => {
                        cache.put(event.request, freshResponse.clone());
                      });
                  }
                })
                .catch(() => {});
            }
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              // If the response is valid, clone it and store in cache
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                    // Limit the size of dynamic cache
                    limitCacheSize(DYNAMIC_CACHE, 30);
                  });
              }
              return response;
            })
            .catch(error => {
              // For image requests, return a default image
              if (event.request.destination === 'image') {
                return caches.match('icons/icon-192.png');
              }
              
              // For other resources, just return an error
              return new Response('Network error happened', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
  }
});

// Handle sync events for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(
      // Here you would implement logic to sync cart data when online
      Promise.resolve()
    );
  }
});