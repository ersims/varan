// Dependencies
import offline, { actions as offlineActions } from './modules/offline';

// Exports
export const actionCreators = Object.assign({}, {
  offlineActions,
});
export const reducers = Object.assign({}, {
  offline,
});
export const epics = Object.assign({}, {});
