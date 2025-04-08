const CACHE_NAME = "sneakcart-v2";

const ASSETS_TO_CACHE = [
  "/Sneakcart/",
  "/Sneakcart/index.html",
  "/Sneakcart/offline.html",
  "/Sneakcart/style.css",
  "/Sneakcart/script.js",
  "/Sneakcart/manifest.json",
  "/Sneakcart/icons/icon-192.png",
  "/Sneakcart/icons/icon-512.png",
  "/Sneakcart/products/shoe1.png",
  "/Sneakcart/products/shoe2.jpg",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
];

// ✅ Install Event
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Caching app shell and assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Immediately activate
});

// ✅ Activate Event
self.addEventListener("activate", (event) => {
  console.log("🔄 Service Worker activating...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑 Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Control pages immediately
});

// ✅ Fetch Event (Offline-first)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/Sneakcart/offline.html");
          }
        })
      );
    })
  );
});

// ✅ Background Sync Event
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-dummy-form") {
    event.waitUntil(
      new Promise((resolve) => {
        console.log("🔁 Background Sync triggered!");
        setTimeout(() => {
          console.log("✅ Dummy form sync simulated");
          resolve();
        }, 2000); // Simulate sync delay
      })
    );
  }
});

// ✅ Push Notification Event
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.text() : "🔥 Hot new drops just landed!";
  event.waitUntil(
    self.registration.showNotification("👟 SneakCart", {
      body: data,
      icon: "/Sneakcart/icons/icon-192.png",
      badge: "/Sneakcart/icons/icon-192.png"
    })
  );
});
