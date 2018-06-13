// Imports
import { createReducer } from 'reduxsauce';

// Types
interface IState {
  action: string;
  location: {
    hash: string;
    key: string;
    pathname: string;
    search: string;
    state?: any;
  };
}

// Initial state
export const initialState: IState = {
  action: '',
  location: {
    hash: '',
    key: '',
    pathname: '',
    search: '',
  },
};

// Actions
export const actions = {};

// Reducers
export default createReducer(initialState, {});
