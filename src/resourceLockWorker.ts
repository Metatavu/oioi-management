/**
 * Registers resource lock service worker
 */
export const register = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/resource-lock-worker.js`)
      .catch(function(err) {
          console.log("Service Worker Failed to Register", err);
      });
  }
};

/**
 * Un-registers resource lock service worker
 */
export const unregister = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
};