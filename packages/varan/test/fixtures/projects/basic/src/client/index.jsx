import React from 'react';
import ReactDOM from 'react-dom';

// Styles
import './sass/index.scss';

const render = () => {
  ReactDOM.hydrate(
    <div className="App">
      <p>Success</p>
    </div>,
    // eslint-disable-next-line no-undef
    document.getElementById('root'),
  );
};
render();
