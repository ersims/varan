import React from 'react';
import ReactDOM from 'react-dom';

const render = () => {
  ReactDOM.hydrate(
    <div className="App">
      <p with syntax error</p>
    </div>,
    document.getElementById('root'),
  );
};
render();
