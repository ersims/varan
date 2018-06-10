// Dependencies
import { actions as offlineActions, reducers as offlineReducers } from './modules/offline';

// Exports
export const actionCreators = Object.assign({}, {
  offlineActions,
});
export const reducers = Object.assign({}, {
  offlineReducers,
});
export const epics = Object.assign({}, {});
