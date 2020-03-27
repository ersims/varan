// See https://serviceworke.rs/live-flowchart_demo.html for more information on service workers

// Exports
export const register = () => {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(window.location.toString());
    const swUrl = `/service-worker.js`;
    const isLocalhost = [/^localhost$/i, /^\[::1]$/, /^127./].some((v) => !!window.location.hostname.match(v));

    // Make sure service worker is app-specific for localhost
    if (isLocalhost) {
      return (
        fetch(swUrl)
          .then((response) => {
            // Invalid service worker?
            if (response.status === 404 || (response.headers.get('content-type') || '').indexOf('javascript') === -1) {
              // Unregister service worker and reload
              return navigator.serviceWorker.ready.then((registration) =>
                registration.unregister().then(() => window.location.reload()),
              );
            }
            return navigator.serviceWorker.register(swUrl).then(() => {
              // Empty
            });
          })
          // Swallow error if app is offline
          .catch(() => {
            // Empty
          })
      );
    }
    if (publicUrl.origin === window.location.origin) return navigator.serviceWorker.register(swUrl); // Only register service worker for same-origin
  }
  return Promise.resolve(null);
};

export const unregister = () => {
  if ('serviceWorker' in navigator)
    return navigator.serviceWorker.ready.then((registration) => registration.unregister());
  return Promise.resolve(null);
};
