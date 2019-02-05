/* eslint-disable */
import { type CurrentPairPayloadType, type CurrentRatePayloadType } from 'demo/packages/bus/busTypes.js';
import Emitter from 'demo/packages/helper/helperClass/Emitter.js';


export default class Api {
  emitter = new Emitter();
  store;
  constructor(store) {
    this.store = store;
  }

  setPair(pair: CurrentPairPayloadType): void {
    this.store.pair = pair;
  }
  setRate(rate: CurrentRatePayloadType): void {
    this.store.rate = rate;
  }
}


