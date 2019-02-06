/* eslint-disable */

import Emitter from 'demo/packages/helper/helperClass/Emitter.js';
import context from 'demo/platform/helper/context.js';
import { ASSET_SERVICE, BALANCE_SERVICE } from 'demo/platform/constants/moduleNames.js';

class InApi {
  emitter = new Emitter();

  subsSelectedAsset(cb): void {
    this.emitter.subscribe(this.subsSelectedAsset, cb);
  }
  subsAssetCollection(cb): void {
    this.emitter.subscribe(this.subsAssetCollection, cb);
  }
  subsBidPrice(cb): void {
    this.emitter.subscribe(this.subsBidPrice, cb);
  }

  getBalance(cb, type){
    context.binder.getStoreAsync(BALANCE_SERVICE).then((store)=>{
      cb(store.balance[type]);
    });
  }

  selectAsset(asset){
    context.binder.getStoreAsync(ASSET_SERVICE).then((store)=>{
      store.selectAsset(asset);
    });
  }
}

export default new InApi();
