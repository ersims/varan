import React from 'react';
import { hot } from 'react-hot-loader';
import Helmet from 'react-helmet';
import favicon from '../../assets/favicon.ico';

// Exports
export const App = hot(module)(() => (
  <div className="App">
    <Helmet>
      <html lang="en" />
      <title itemProp="name" lang="en">
        Varan basic react example
      </title>
      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="A varan react starter app" />
      <meta name="og:type" content="website" />
      <link rel="icon" href={favicon} />
    </Helmet>
    <header className="header">
      <h1 className="title">Welcome to React that works awesomely</h1>
    </header>
    <p className="intro">
      To get started, edit <code>src/client/components/App.js</code> and save to reload.
    </p>
    <p className="styles">
      You can edit any styling in <code>src/client/sass/index.scss</code>.
    </p>
    <p className="server">
      The backend server is located in <code>src/server</code>, with <code>src/server/bin/web</code> being the webserver
      you are using to see this page.
    </p>
  </div>
));
