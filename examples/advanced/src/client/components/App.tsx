import * as React from 'react';
import { hot } from 'react-hot-loader';
import Helmet from 'react-helmet';
import { Route, Switch } from 'react-router';
import favicon from '../../assets/favicon.ico';
import NavBar from './NavBar';

// Pages
import Home from '../pages/Home';
import About from '../pages/About';
import NotFound from '../pages/errors/NotFound';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Helmet>
          <html lang="en" />
          <title itemProp="name" lang="en">
            Varan
          </title>
          <meta charSet="utf-8" />
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="A varan react starter app" />
          <meta name="og:type" content="website" />
          <meta name="theme-color" content="#49aa6a" />
          <link rel="icon" href={favicon} />
        </Helmet>
        <div className="AppContainer">
          <NavBar />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/shell" component={() => null} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default hot(module)(App);
