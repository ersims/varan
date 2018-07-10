// Imports
import { createReducer } from 'reduxsauce';
import { createStandardAction, getType } from 'typesafe-actions';
import { Epic } from 'redux-observable';

// Types
export enum Actions {
  OFFLINE_ENABLED = 'varan/offline/ENABLED',
  OFFLINE_DISABLED = 'varan/offline/DISABLED',
  OFFLINE_CACHE_ENABLE = 'varan/offline/CACHE_ENABLE',
  OFFLINE_CACHE_ENABLED = 'varan/offline/CACHE_ENABLED',
  OFFLINE_CACHE_CHECK = 'varan/offline/CACHE_CHECK',
  OFFLINE_CACHE_UPDATED = 'varan/offline/CACHE_UPDATED',
  OFFLINE_CACHE_DISABLE = 'varan/offline/CACHE_DISABLE',
  OFFLINE_CACHE_DISABLED = 'varan/offline/CACHE_DISABLED',
}
interface IState {
  isEnabled: boolean;
  isUpdated: boolean;
  isOffline: boolean;
  lastError: Error | null;
}

// Initial state
export const initialState: IState = {
  isEnabled: false, // Is service worker enabled?
  isUpdated: false, // Has assets been updated in the background and reload is necessary?
  isOffline: true,
  lastError: null,
};

// Actions
export const actions = {
  setOffline: createStandardAction(Actions.OFFLINE_ENABLED)(),
  setOnline: createStandardAction(Actions.OFFLINE_DISABLED)(),
  cacheEnable: createStandardAction(Actions.OFFLINE_CACHE_ENABLE)(),
  cacheEnabled: createStandardAction(Actions.OFFLINE_CACHE_ENABLED)(),
  cacheCheck: createStandardAction(Actions.OFFLINE_CACHE_CHECK)(),
  cacheUpdated: createStandardAction(Actions.OFFLINE_CACHE_UPDATED)(),
  cacheDisable: createStandardAction(Actions.OFFLINE_CACHE_DISABLE)(),
  cacheDisabled: createStandardAction(Actions.OFFLINE_CACHE_DISABLED)(),
};

// Reducers
export default createReducer(initialState, {
  [getType(actions.setOffline)]: (state = initialState) => ({
    ...state,
    isOffline: true,
  }),
  [getType(actions.setOnline)]: (state = initialState) => ({
    ...state,
    isOffline: false,
  }),
  [getType(actions.cacheEnabled)]: (state = initialState) => ({
    ...state,
    isEnabled: true,
  }),
  [getType(actions.cacheUpdated)]: (state = initialState) => ({
    ...state,
    isUpdated: true,
  }),
  [getType(actions.cacheDisabled)]: (state = initialState) => ({
    ...state,
    isEnabled: false,
  }),
});

// Epics
export const epics: Epic[] = [];
