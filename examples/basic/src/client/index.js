import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

// Styles
import './sass/index.scss';

// Init
const render = () => {
  ReactDOM.hydrate(<App />, document.getElementById('root'));
};

// Render app and perform necessary housekeeping
render();

// // Enable hot reloading
if (module.hot) module.hot.accept('./components/App', render);
