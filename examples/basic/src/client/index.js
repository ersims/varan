import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

// Init
const render = () => {
  ReactDOM.hydrate(
    <App />,
    document.getElementById('root'),
  );
};

// Render app and perform necessary housekeeping
render();

// // Enable hot reloading
if (module.hot) module.hot.accept('./components/App', render);
