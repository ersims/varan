// Imports
import { createReducer } from 'reduxsauce';
import { ActionType, createStandardAction, getType } from 'typesafe-actions';
import { Epic } from 'redux-observable';

// Helpers
const getIsIOS = () => navigator !== undefined && /i(phone|pad|pod)/.test(navigator.userAgent.toLowerCase());
const getIsStandalone = () => navigator !== undefined && 'standalone' in navigator && (navigator as any).standalone;

// Types
export enum Actions {
  APPLICATION_INIT = 'varan/application/INIT',
}
interface IState {
  isInit: boolean;
  isIOS: boolean;
  isStandalone: boolean;
}

// Initial state
export const initialState: IState = {
  isInit: false,
  isIOS: false,
  isStandalone: false,
};

// Actions
export const actions = {
  init: createStandardAction(Actions.APPLICATION_INIT).map(() => ({
    payload: { isIOS: getIsIOS(), isStandalone: getIsStandalone() },
  })),
};

// Reducers
export default createReducer(initialState, {
  [getType(actions.init)]: (state = initialState, action: ActionType<typeof actions.init>) => ({
    ...state,
    isInit: true,
    isIOS: action.payload.isIOS,
    isStandalone: action.payload.isStandalone,
  }),
});

// Epics
export const epics: Epic[] = [];
