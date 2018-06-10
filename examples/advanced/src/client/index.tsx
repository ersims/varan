import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import { register } from './serviceWorker';
import createStore from './redux/createStore';
import { actions as offlineActions } from './redux/modules/offline';

// Styles
import './sass/index.scss';

// Init
const store = createStore('__INITIAL_REDUX_STATE__' in window ? (window as any).__INITIAL_REDUX_STATE__ : undefined);
window.addEventListener('load', () => register()
  .then((registration) => {
    if (registration) {
      self.addEventListener('error', errorEvent => store.dispatch(offlineActions.serviceWorkerError(errorEvent.error))); // eslint-disable-line no-restricted-globals
      if (navigator.serviceWorker.controller) store.dispatch(offlineActions.cacheLoaded());
      registration.onupdatefound = function waitForInstall() {
        if (this.installing) {
          this.installing.onstatechange = (e: Event) => {
            if (e.target && 'state' in e.target && (e.target as any).state === 'installed') {
              if (navigator.serviceWorker.controller) store.dispatch(offlineActions.cacheUpdated());
              else store.dispatch(offlineActions.cacheLoaded());
            }
          };
        }
      };
    }
  })
  .catch(err => store.dispatch(offlineActions.serviceWorkerError(err))));

// Render app and perform necessary housekeeping
const render = () => {
  ReactDOM.hydrate(
    <Provider store={store}>
      <App />
    </Provider>
    , document.getElementById('root'));
};
render();


// // Enable hot reloading
if (module.hot) module.hot.accept('./components/App', render);
