/* eslint-disable */
import { type CurrentPairPayloadType, type CurrentRatePayloadType } from 'demo/packages/bus/busTypes.js';
import Emitter from 'demo/packages/helper/helperClass/Emitter.js';
import context from 'demo/platform/helper/context.js';
import { ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';

class Api {
  emitter = new Emitter();

  subsSelectedAsset(cb): void {
    this.emitter.subscribe(this.subsSelectedAsset, cb);
  }
  subsAssetCollection(cb): void {
    this.emitter.subscribe(this.subsAssetCollection, cb);
  }

  selectAsset(asset){

    context.binder.getStoreAsync(ASSET_SERVICE).then((store)=>{
      console.log([1234, store]);
    });

  }

}

export default new Api();
