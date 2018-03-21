import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';

class App extends PureComponent {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React that works awesomely</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default hot(module)(App);
