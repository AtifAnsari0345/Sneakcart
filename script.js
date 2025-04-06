// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker registered!', reg.scope);
        
        // Set up sync after SW registration
        setupBackgroundSync(reg);
        setupPushDemo();
      })
      .catch(err => {
        console.error('❌ Service Worker registration failed:', err);
      });
  });
}

// Background Sync Setup
function setupBackgroundSync(swReg) {
  const form = document.getElementById('dummyForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('dummyInput');
    const status = document.getElementById('status');
    
    // Store data in localStorage for demo
    localStorage.setItem('syncData', input.value);
    
    // Register sync
    swReg.sync.register('sync-form')
      .then(() => {
        status.textContent = '🔄 Sync registered! Will complete when online.';
        status.style.color = 'var(--primary)';
        input.value = '';
      })
      .catch(err => {
        status.textContent = '❌ Sync registration failed';
        status.style.color = 'var(--danger)';
        console.error('Sync registration failed:', err);
      });
  });
}

// Push Notification Demo
function setupPushDemo() {
  const pushButton = document.createElement('button');
  pushButton.className = 'sync-button';
  pushButton.innerHTML = '<i class="fas fa-bell"></i> Test Push Notification';
  pushButton.onclick = triggerTestPush;
  
  const syncSection = document.querySelector('.sync-section');
  if (syncSection) {
    syncSection.appendChild(pushButton);
  }
}

function triggerTestPush() {
  navigator.serviceWorker.ready
    .then(reg => {
      reg.active.postMessage({
        method: "pushMessage",
        message: "🎉 New deal on Sneakers! 50% OFF today only!"
      });
      alert('Test push notification sent! Check your notifications.');
    })
    .catch(err => {
      console.error('Push test failed:', err);
    });
}