import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import { register } from './serviceWorker';

// Styles
import './sass/index.scss';

// Init
window.addEventListener('load', register);

// Render app and perform necessary housekeeping
const render = () => {
  ReactDOM.hydrate(<App />, document.getElementById('root'));
};
render();

// // Enable hot reloading
if (module.hot) module.hot.accept('./components/App', render);