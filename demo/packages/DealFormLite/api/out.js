/* eslint-disable */
import { type CurrentPairPayloadType, type CurrentRatePayloadType } from 'demo/packages/bus/busTypes.js';
import Emitter from 'demo/packages/helper/helperClass/Emitter.js';


export default class OutApi {
  constructor(middleware) {
    this.middleware = middleware;
  }

  getAsset(rate): void {
    return this.middleware.getAsset();
  }
}


