// @flow
import { observable } from 'mobx';
import type { IAssetService, IAccountService, IState } from './types.js';

class State implements IState {
  @observable.ref
  asset: IAssetService;
  @observable.ref
  account: IAccountService;
}
const state: IState = new State();
export default state;

