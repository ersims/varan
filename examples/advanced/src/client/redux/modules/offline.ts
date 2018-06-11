// Imports
import { createReducer } from 'reduxsauce';
import { ActionType, createStandardAction, getType } from 'typesafe-actions';

// Types
export enum Actions {
  OFFLINE_CACHE_LOADED = 'varan/offline/CACHE_LOADED',
  OFFLINE_CACHE_UPDATED = 'varan/offline/CACHE_UPDATED',
  OFFLINE_SERVICE_WORKER_ERROR = 'varan/offline/SERVICE_WORKER_ERROR',
}
interface IState {
  isCached: boolean;
  isOutdated: boolean;
  isOnline: boolean;
  lastError: Error | null;
}

// Initial state
export const initialState: IState = {
  isCached: false, // Has assets been cached and app ready for offline-mode?
  isOutdated: false, // Has assets been updated in the background and reload is necessary?
  isOnline: true, // TODO: Is the app online or offline?
  lastError: null,
};

// Actions
export const actions = {
  cacheLoaded: createStandardAction(Actions.OFFLINE_CACHE_LOADED)(),
  cacheUpdated: createStandardAction(Actions.OFFLINE_CACHE_UPDATED)(),
  serviceWorkerError: createStandardAction(Actions.OFFLINE_SERVICE_WORKER_ERROR)<Error>(),
};

// Reducers
export default createReducer(initialState, {
  [getType(actions.cacheLoaded)]: (state = initialState) => ({
    ...state,
    isCached: true,
  }),
  [getType(actions.cacheUpdated)]: (state = initialState) => ({
    ...state,
    isOutdated: true,
  }),
  [getType(actions.serviceWorkerError)]: (state = initialState, action: ActionType<typeof actions.serviceWorkerError>) => ({
    ...state,
    lastErrors: action.payload,
  }),
});
