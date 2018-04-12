import React from 'react';
import ReactDOM from 'react-dom';

// Styles
import './sass/index.scss';

const render = () => {
  ReactDOM.hydrate(
    <div className="App">
      <p>Success</p>
    </div>,
    document.getElementById('root'),
  );
};
render();
