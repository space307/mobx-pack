import { observable } from 'mobx';

// export const state = {
//  assets: null,
// };
//
//
// export const stateOptions = {
//   assets: {
//     active: false
//   }
// };

class State {
  @observable.ref
  asset = null;
  @observable.ref
  account = null;
}
const state = new State();
export default state;

//
// class StateOptions {
//
//   asset = null;
// }
