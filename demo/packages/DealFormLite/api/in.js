/* eslint-disable */
import Emitter from 'demo/packages/helper/helperClass/Emitter.js';


export default class In {
  emitter = new Emitter();
  store;
  constructor(store) {
    this.store = store;
  }

  setAmount(amount): void {
    this.store.amount = amount;
  }
}


