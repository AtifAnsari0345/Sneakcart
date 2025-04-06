const CACHE_NAME = "sneakcart-v2";
const ASSETS_TO_CACHE = [
  "/Sneakcart/",
  "/Sneakcart/index.html",
  "/Sneakcart/style.css",
  "/Sneakcart/script.js",
  "/Sneakcart/manifest.json",
  "/Sneakcart/icons/icon-192.png",
  "/Sneakcart/icons/icon-512.png",
  "/Sneakcart/products/shoe1.png",
  "/Sneakcart/products/shoe2.jpg",
  "/Sneakcart/products/shoe3.jpg", // ➕ Add any additional assets here
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
];

// ✅ Install
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Caching app shell and assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate worker immediately
});

// ✅ Activate
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
  self.clients.claim(); // Take control immediately
});

// ✅ Fetch (Offline-first)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Offline fallback for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/Sneakcart/index.html");
          }
        })
      );
    })
  );
});

// ✅ Background Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-dummy-form") {
    event.waitUntil(
      // Simulate form re-submission or API retry
      new Promise((resolve) => {
        console.log("🔁 Background Sync triggered!");
        setTimeout(resolve, 2000);
      })
    );
  }
});

// ✅ Push Notifications (demo setup)
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