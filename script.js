// Handle form submission
document.getElementById("dummyForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const inputField = document.getElementById("dummyInput");
  const inputValue = inputField.value.trim();
  const status = document.getElementById("status");

  if (!inputValue) {
    status.textContent = "⚠️ Please enter something before submitting.";
    return;
  }

  // Save to localStorage so the service worker can access it later
  localStorage.setItem("sneakcart-sync-data", inputValue);

  status.textContent = "⏳ Queued for sync...";

  // Check for Service Worker and SyncManager support
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready
      .then((reg) => {
        return reg.sync.register("sync-dummy-form");
      })
      .then(() => {
        inputField.value = ""; // Clear the form
        status.textContent = "✅ Will sync when back online!";
      })
      .catch((err) => {
        console.error("❌ Sync registration failed:", err);
        status.textContent = "❌ Sync failed or not supported.";
      });
  } else {
    status.textContent = "❌ Background Sync not supported in this browser.";
  }
});

// Listen for Service Worker requesting localStorage data
navigator.serviceWorker?.addEventListener("message", (event) => {
  if (event.data?.type === "GET_LOCAL_DATA") {
    const value = localStorage.getItem(event.data.key);
    event.ports[0].postMessage(value);
  }
});