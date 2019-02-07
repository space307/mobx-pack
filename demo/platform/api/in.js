/* eslint-disable */

import { ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';

class InApi {

  start({binder}){
    this.binder = binder;
  }


  setAsset(asset){
    this.binder.getStoreAsync(ASSET_SERVICE).then((store)=>{
      store.selectAsset(asset);
    });
  }

}

export default new InApi();


