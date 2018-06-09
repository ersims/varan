// See https://serviceworke.rs/live-flowchart_demo.html for more information on service workers

// Exports
export const register = () => {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(window.location);
    const swUrl = `/service-worker.js`;
    const isLocalhost = [/^localhost$/i, /^\[::1]$/, /^127./].some(v => window.location.hostname.match(v));

    // Make sure service worker is app-specific for localhost
    if (isLocalhost) {
      return fetch(swUrl)
        .then(response => {
          if (response.status === 404 || response.headers.get('content-type').indexOf('javascript') === -1) {
            // Invalid service worker?
            return navigator.serviceWorker.ready.then(registration =>
              registration.unregister().then(() => window.location.reload()),
            ); // Unregister service worker and reload
          }
          return navigator.serviceWorker.register(swUrl);
        })
        .catch(() => {}); // Swallow error if app is offline
    } else if (publicUrl.origin === window.location.origin) return navigator.serviceWorker.register(swUrl); // Only register service worker for same-origin
  }
  return Promise.resolve(null);
};

export const unregister = () => {
  if ('serviceWorker' in navigator)
    return navigator.serviceWorker.ready.then(registration => registration.unregister());
  return Promise.resolve(null);
};
