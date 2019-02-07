
import { toJS } from 'mobx';
import { ASSET_SERVICE, BALANCE_SERVICE } from 'demo/platform/constants/moduleNames.js';

class InApi {
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
}

export default new InApi();

