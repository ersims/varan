// Dependencies
import { applyMiddleware, combineReducers, createStore, Middleware } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import { epics, reducers } from './index';

// Init
const epicMiddleware = createEpicMiddleware(
  combineEpics(...Object.values(epics).reduce((acc, cur) => acc.concat(cur), [])),
);
const loggerMiddleware =
  typeof window !== 'undefined' &&
  createLogger({
    collapsed: (getState, action, logEntry) => (!logEntry || !logEntry.error) && !action.error && !action.isError,
    predicate: () => '__DEV__' in window || (process && process.env && process.env.NODE_ENV === 'development'),
  });
const composeEnhancers = composeWithDevTools({ serialize: true });

// Exports
/**
 * Create redux store with initial state
 *
 * @param {object} initialState
 * @returns {Store<any> & {dispatch: any}}
 */
export default (initialState = {}) => {
  const enhancer = composeEnhancers(
    applyMiddleware(...([epicMiddleware, loggerMiddleware].filter(Boolean) as Middleware[])),
  );
  return createStore(combineReducers(reducers), initialState, enhancer);
};
