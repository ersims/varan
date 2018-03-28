import React from 'react';
import ReactDOM from 'react-dom';
const path = './dummy';
const dummy = require(path);
const render = () => {
  ReactDOM.hydrate(
    <div className="App">
      <p>with dynamic require warning: ${dummy}</p>
    </div>,
    document.getElementById('root'),
  );
};
render();
