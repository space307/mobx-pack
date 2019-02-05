// @flow
import { observable, action, reaction } from 'mobx';
import { ServiceConnector } from 'sources.js';
import {
  PRICE_SERVICE,
  ASSET_SERVICE,
} from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';
import type { PriceServiceInterface } from 'demo/platform/services/PriceService/typing/interfaces.js';
import type { AssetServiceInterface } from 'demo/platform/services/AssetService/typing/interfaces.js';
import inApi from 'demo/platform/api/in.js';

function randNumber(min, max) {
  return Math.floor(Math.random() * (max - (min + 1))) + min;
}

export class PriceService implements PriceServiceInterface {
  @observable bidPrice: ?number = null;
  @observable askPrice: ?number = null;
  asset: ?string = null;

  assetService: AssetServiceInterface;

  init() {}
  onBind(assetService: AssetServiceInterface) {
    this.assetService = assetService;

    reaction(
      () => this.assetService.selectedAssetData,
      () => {
        this.asset =
          this.assetService.selectedAssetData &&
          this.assetService.selectedAssetData.id;
        this.generatePrice();
      },
      {
        fireImmediately: true,
      },
    );

    reaction(
      () => this.bidPrice,
      (bidPrice) => {
        inApi.emitter.emit(inApi.subsBidPrice, bidPrice);
      },
      {
        fireImmediately: true,
      },
    );


    setInterval(() => {
      this.generatePrice();
    }, 1000);
  }

  @action generatePrice() {
    if (this.assetService.selectedAssetData) {
      const { minPrice, spread } = this.assetService.selectedAssetData;
      this.bidPrice = randNumber(minPrice - 10, minPrice + 10);
      this.askPrice = randNumber(
        minPrice + spread + 10,
        minPrice + (spread - 10),
      );
    }
  }
}

export default ServiceConnector(new PriceService(), {
  binder: context.binder,
  onStart: 'init',
  config: {
    bindAs: PRICE_SERVICE,
    onBind: [[ASSET_SERVICE, 'onBind']],
  },
});
