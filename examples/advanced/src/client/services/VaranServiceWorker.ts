// Dependencies
import { EventEmitter } from 'events';

// Types
export enum VaranServiceWorkerEvents {
  REGISTERED = 'REGISTERED',
  UPDATE_AVAILABLE = 'UPDATE_AVAILABLE',
  UNREGISTERED = 'UNREGISTERED',
}

// See https://serviceworke.rs/live-flowchart_demo.html for more information on service workers
class VaranServiceWorker extends EventEmitter {
  public swUrl: string;

  /**
   * Create a managed service worker instance
   *
   * @param {string=} swUrl
   */
  constructor(swUrl = '/service-worker.js') {
    super();
    this.swUrl = swUrl;
  }

  /**
   * Register a service worker
   *
   * @returns {Promise<this>}
   */
  public async register(): Promise<this> {
    if ('serviceWorker' in navigator) {
      const publicUrl = new URL(window.location.toString());
      const isLocalhost = [/^localhost$/i, /^\[::1]$/, /^127./].some(v => v.test(window.location.hostname));

      // Make sure service worker is app-specific for localhost
      if (false && isLocalhost) {
        try {
          const response = await fetch(this.swUrl);

          // Invalid service worker?
          if (response.status === 404 || (response.headers.get('content-type') || '').indexOf('javascript') === -1) {
            // Unregister service worker and reload
            await this.unregister();
            window.location.reload();
            return this;
          }
        } catch (err) {
          return this;
        }
      }

      // Only register service worker for same-origin
      if (publicUrl.origin === window.location.origin) {
        const registration = await navigator.serviceWorker.register(this.swUrl);
        this.emit(VaranServiceWorkerEvents.REGISTERED, this);
        registration.onupdatefound = () => {
          const installingWorker = registration.installing!;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.emit(VaranServiceWorkerEvents.UPDATE_AVAILABLE, this);
            }
          };
        };
      }
    }
    return this;
  }

  /**
   * Update service worker cache
   *
   * @returns {Promise<this>}
   */
  public async update(): Promise<this> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    }
    return this;
  }

  /**
   * Remove service worker registration
   *
   * @returns {Promise<this>}
   */
  public async unregister(): Promise<this> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      this.emit(VaranServiceWorkerEvents.UNREGISTERED, this);
    }
    return this;
  }
}

// Exports
export default VaranServiceWorker;
