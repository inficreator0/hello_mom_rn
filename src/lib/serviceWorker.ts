// Service Worker Registration and Update Management

let registration: ServiceWorkerRegistration | null = null;
let updateAvailable = false;

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          registration = reg;
          console.log('[Service Worker] Registered successfully:', reg.scope);

          // Check for updates immediately
          checkForUpdates();

          // Check for updates periodically (every hour)
          setInterval(checkForUpdates, 60 * 60 * 1000);

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  updateAvailable = true;
                  console.log('[Service Worker] New version available');
                  notifyUpdateAvailable();
                }
              });
            }
          });

          // Listen for controller change (update activated)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[Service Worker] New version activated');
            window.location.reload();
          });
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error);
        });
    });
  }
};

export const checkForUpdates = () => {
  if (registration) {
    registration
      .update()
      .then(() => {
        console.log('[Service Worker] Checked for updates');
      })
      .catch((error) => {
        console.error('[Service Worker] Update check failed:', error);
      });
  }
};

export const skipWaiting = () => {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};

export const isUpdateAvailable = () => {
  return updateAvailable;
};

const notifyUpdateAvailable = () => {
  // Dispatch custom event that components can listen to
  window.dispatchEvent(
    new CustomEvent('sw-update-available', {
      detail: { registration },
    })
  );
};

export const unregister = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
};
