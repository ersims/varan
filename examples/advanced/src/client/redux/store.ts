// Dependencies
import { combineReducers } from 'redux';
import createStore from './createStore';

// Init
const store = createStore('__INITIAL_REDUX_STATE__' in window ? (window as any).__INITIAL_REDUX_STATE__ : undefined);

// Hot reload store
const reloadStore = () => store.replaceReducer(combineReducers(require('./index').reducers));
if (module.hot) {
  module.hot.accept('./createStore', reloadStore);
  module.hot.accept('./index', reloadStore);
}

// Exports
export default store;
