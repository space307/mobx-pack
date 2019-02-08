
import { toJS } from 'mobx';
import Emitter from 'demo/packages/helper/helperClass/Emitter.js';
import { ASSET_SERVICE, BALANCE_SERVICE } from 'demo/platform/constants/moduleNames.js';


class Api {
  emitter = new Emitter();

  start({ binder }) {
    this.binder = binder;
  }

  getBalance(cb) {
    this.binder.getStoreAsync(BALANCE_SERVICE).then((store) => {
      cb(toJS(store.balance));
    });
  }

  setAsset(asset) {
    this.binder.getStoreAsync(ASSET_SERVICE).then((store) => {
      store.selectAsset(asset);
    });
  }

  subsPrice(cb) {
    this.emitter.subscribe(this.subsPrice, cb);
  }
  subsAsset(cb) {
    this.emitter.subscribe(this.subsAsset, cb);
  }
  subsDealFormAmount(cb) {
    this.emitter.subscribe(this.subsDealFormAmount, cb);
  }
}


export default new Api();

