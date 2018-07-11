import * as React from 'react';
import { connect } from 'react-redux';
import boundActions from '../../redux/boundActions';
import { actionCreators } from '../../redux';
import VaranServiceWorker, { VaranServiceWorkerEvents } from '../../services/VaranServiceWorker';

export default (autoEnable = true, updateCheckInterval = 60 * 60 * 1000) => <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  class WithOffline extends React.Component<P & Pick<typeof actionCreators, 'offlineActions'>> {
    protected serviceWorker: VaranServiceWorker = new VaranServiceWorker();
    protected timer: ReturnType<typeof setTimeout> | null = null;

    // State handlers
    public handleRegister = () => this.props.offlineActions.cacheEnabled();
    public handleUpdated = () => this.props.offlineActions.cacheUpdated();
    public handleUnregister = () => this.props.offlineActions.cacheDisabled();
    public handleOffline = () => this.props.offlineActions.setOffline();
    public handleOnline = () => this.props.offlineActions.setOnline();

    /**
     * Create update check timer
     *
     * @param {number} waitInterval
     */
    public createCheckForUpdatesTimer = (waitInterval: number) => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.props.offlineActions.cacheCheck();
        this.serviceWorker.update();
        this.createCheckForUpdatesTimer(waitInterval);
      }, waitInterval);
    };
    public componentDidMount() {
      // Add event listeners
      window.addEventListener('offline', this.handleOffline);
      window.addEventListener('online', this.handleOnline);
      this.serviceWorker.addListener(VaranServiceWorkerEvents.REGISTERED, this.handleRegister);
      this.serviceWorker.addListener(VaranServiceWorkerEvents.UPDATE_AVAILABLE, this.handleUpdated);
      this.serviceWorker.addListener(VaranServiceWorkerEvents.UNREGISTERED, this.handleUnregister);

      // Set offline mode
      if (navigator.onLine) this.handleOnline();
      else this.handleOffline();

      // Enable?
      if (autoEnable) {
        this.props.offlineActions.cacheEnable();
        this.serviceWorker.register();

        // Add update timer?
        if (updateCheckInterval) this.createCheckForUpdatesTimer(updateCheckInterval);
      }
    }
    public componentWillUnmount() {
      if (this.timer) clearTimeout(this.timer);
      window.removeEventListener('offline', this.handleOffline);
      window.removeEventListener('online', this.handleOnline);
      this.serviceWorker.removeListener(VaranServiceWorkerEvents.REGISTERED, this.handleRegister);
      this.serviceWorker.removeListener(VaranServiceWorkerEvents.UPDATE_AVAILABLE, this.handleUpdated);
      this.serviceWorker.removeListener(VaranServiceWorkerEvents.UNREGISTERED, this.handleUnregister);
    }
    public render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return connect(
    null,
    boundActions<any, any>('offlineActions'),
  )(WithOffline);
};
