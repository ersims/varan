// Dependencies
import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';

// Modules
import application, { actions as applicationActions, epics as applicationEpics } from './modules/application';
import offline, { actions as offlineActions, epics as offlineEpics } from './modules/offline';
import router, { actions as routerActions } from './modules/router';

// Exports
export const actionCreators = Object.assign(
  {},
  {
    applicationActions,
    offlineActions,
    routerActions,
  },
);
export const reducers = Object.assign(
  {},
  {
    application,
    offline,
    router,
  },
);
export const rootReducer = combineReducers(reducers);
export const epics = Object.assign(
  {},
  {
    applicationEpics,
    offlineEpics,
  },
);

// Types
export type RootState = StateType<typeof rootReducer>;
