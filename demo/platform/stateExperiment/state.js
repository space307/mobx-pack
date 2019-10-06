import { observable } from 'mobx';

class State {
  @observable.ref
  asset = null;
  @observable.ref
  account = null;
}
const state = new State();
export default state;

