/*
 * This is a temporary fix for https://github.com/zalmoxisus/redux-devtools-extension/issues/492
 * Revert when https://github.com/zalmoxisus/redux-devtools-extension/pull/493 is merged
 */

import { StoreEnhancer } from 'redux';
declare module 'redux' {
  export type GenericStoreEnhancer = StoreEnhancer;
}
