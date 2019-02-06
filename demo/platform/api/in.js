/* eslint-disable */

import { ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';

class InApi {

  start({middleware, binder}){
    this.middleware = middleware;
    this.binder = binder;

    this.getAsset();
  }


  getAsset(){
    this.middleware.getAsset((asset)=>{
      this.binder.getStoreAsync(ASSET_SERVICE).then((store)=>{
        store.selectAsset(asset);
      });
    });
  }

}

export default new InApi();


