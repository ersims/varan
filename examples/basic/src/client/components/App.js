import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import Helmet from 'react-helmet';

class App extends PureComponent {
  render() {
    return (
      <div className="App">
        <Helmet>
          <html lang="en" />
          <title itemProp="name" lang="en">Varan basic react example</title>
          <meta charSet="utf-8" />
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="A varan react starter app" />
          <meta name="og:type" content="website" />
        </Helmet>
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
