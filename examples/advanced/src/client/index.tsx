import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { history, store } from './redux/store';
import { compose } from 'recompose';
import App from './components/App';
import withApplicationState from './components/enhancers/withApplicationState';
import withOffline from './components/enhancers/withOffline';

// Styles
import './sass/index.scss';
import { withRouter } from 'react-router';

// Init
const EnhancedApp = withRouter<typeof App>(
  compose(
    withOffline(),
    withApplicationState(),
  )(App),
);

// Render app and perform necessary housekeeping
const render = () => {
  ReactDOM.hydrate(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <EnhancedApp />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root'),
  );
};
render();

// // Enable hot reloading
if (module.hot) module.hot.accept('./components/App', render);
