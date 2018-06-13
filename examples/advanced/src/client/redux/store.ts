// Dependencies
import createStore from './createStore';

// Init
const { store, history } = createStore(
  '__INITIAL_REDUX_STATE__' in window ? (window as any).__INITIAL_REDUX_STATE__ : undefined,
);

// Hot reload store
const reloadStore = () => store.replaceReducer(require('./index').rootReducer);
// TODO: Improve hot reload integration
if (module.hot) {
  module.hot.accept('./createStore', reloadStore);
  module.hot.accept('./index', reloadStore);
}

// Exports
export { store, history };
