// Dependencies
import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';

// Modules
import offline, { actions as offlineActions } from './modules/offline';
import router, { actions as routerActions } from './modules/router';

// Exports
export const actionCreators = Object.assign(
  {},
  {
    offlineActions,
    routerActions,
  },
);
export const reducers = Object.assign(
  {},
  {
    offline,
    router,
  },
);
export const rootReducer = combineReducers(reducers);
export const epics = Object.assign({}, {});

// Types
export type RootState = StateType<typeof rootReducer>;
