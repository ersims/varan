// Dependencies
import { applyMiddleware, createStore, Middleware } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import createRouterHistory from '../lib/createRouterHistory';
import { epics, rootReducer } from './index';

// Init
const rootEpic = combineEpics(...Object.values(epics).reduce((acc, cur) => acc.concat(cur), []));
const loggerMiddleware =
  typeof window !== 'undefined' &&
  createLogger({
    collapsed: (getState, action, logEntry) =>
      (!logEntry || !logEntry.error) && !action.error && !action.isError && !(action.payload instanceof Error),
    predicate: () => true || '__DEV__' in window || (process && process.env && process.env.NODE_ENV === 'development'),
  });
const composeEnhancers = composeWithDevTools({ serialize: true });

// Exports
/**
 * Create redux store with initial state
 *
 * @param {{}} initialState
 * @returns {{store: *; history: History}}
 */
export default (initialState = {}) => {
  const history = createRouterHistory();
  const epicMiddleware = createEpicMiddleware();
  const enhancer = composeEnhancers(
    applyMiddleware(...([routerMiddleware(history), epicMiddleware, loggerMiddleware].filter(Boolean) as Middleware[])),
  );
  const store = createStore(connectRouter(history)(rootReducer), initialState, enhancer);
  epicMiddleware.run(rootEpic);
  return { store, history };
};
