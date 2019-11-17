import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';

// Styles
import './styles/index.scss';

// Render app and perform necessary housekeeping
const render = () => {
  ReactDOM.hydrate(<App />, document.getElementById('root'));
};
render();

// Enable hot reloading
if (module.hot) module.hot.accept('./components/App', render);
