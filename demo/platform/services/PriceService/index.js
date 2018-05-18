import { BaseStore } from 'mobx-pack';
import { observable, action, computed, reaction, runInAction } from 'mobx';
import { PRICE_SERVICE, ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';

function randNumber(min, max) {
  return Math.floor(Math.random() * (max - (min + 1))) + min;
}

export class PriceService extends BaseStore {
  config = {
    bindAs: PRICE_SERVICE,
    importData: {
      [ASSET_SERVICE]: {
        selectedAssetData: 'selectedAssetData',
      },
    },
    exportData: {
      bidPrice: 1,
      askPrice: 1,
    },
    waitFor: [ASSET_SERVICE],
  };

  api = {};

  @observable bidPrice = null;
  @observable askPrice = null;
  asset = null;


  onStart() {
    reaction(
      () => (this.selectedAssetData),
      () => {
        this.asset = this.selectedAssetData.id;
        this.generatePrice();
      }, true,
    );

    setInterval(() => {
      this.generatePrice();
    }, 1000);

    return true;
  }

  @action generatePrice() {
    if (this.selectedAssetData) {
      const { minPrice, spread } = this.selectedAssetData;
      this.bidPrice = randNumber(minPrice - 10, minPrice + 10);
      this.askPrice = randNumber(minPrice + spread + 10, minPrice + (spread - 10));
    }
  }
}


export default new PriceService(context);
