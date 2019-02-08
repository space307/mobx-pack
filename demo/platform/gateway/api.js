
import { reaction, toJS } from 'mobx';
import Emitter from 'demo/packages/helper/helperClass/Emitter.js';
import { ASSET_SERVICE, BALANCE_SERVICE, API_SERVICE, PRICE_SERVICE } from 'demo/platform/constants/moduleNames.js';
import { PLATFORM_EVENTS, DEAL_FORM_LITE_EVENTS } from 'demo/packages/bus/busTypes.js';
import bus from 'demo/packages/bus/bus.js';
import { ServiceConnector } from 'sources.js';
import context from '../helper/context.js';


class ApiService {
  emitter = new Emitter();

  balanceService;
  assetService;
  priceService;
  reactions;

  api = {
    setDealFormAmount: (data) => {
      this.setDealFormAmount(data);
    },
  };

  onBind(balanceService, assetService, priceService) {
    this.balanceService = balanceService;
    this.assetService = assetService;
    this.priceService = priceService;


    bus.select(PLATFORM_EVENTS.GET_BALANCE).subscribe(() => {
      bus.emit({
        type: PLATFORM_EVENTS.CURRENT_BALANCE,
        payload: this.getBalance(),
      });
    });
    bus.select(DEAL_FORM_LITE_EVENTS.SET_ASSET).subscribe(({ payload }) => {
      this.selectAsset(payload);
    });

    this.initReactions();
  }

  initReactions() {
    this.reactions = [
      reaction(
        () => this.priceService.bidPrice,
        (selectedAsset) => {
          bus.emit({
            type: PLATFORM_EVENTS.CURRENT_PRICE,
            payload: toJS(selectedAsset),
          });
        }, { fireImmediately: true },
      ),
      reaction(
        () => this.assetService.selectedAssetData,
        (selectedAsset) => {
          bus.emit({
            type: PLATFORM_EVENTS.CURRENT_ASSET,
            payload: toJS(selectedAsset),
          });
        }, { fireImmediately: true },
      ),

    ];
  }

  getBalance() {
    return this.balanceService.balance;
  }

  selectAsset(asset) {
    this.assetService.selectAsset(asset);
  }

  setDealFormAmount = (amount) => {
    bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_AMOUNT,
      payload: amount,
    });
  }
}


const apiService = new ApiService();
export default ServiceConnector(apiService, {
  binder: context.binder,
  config: {
    bindAs: API_SERVICE,
    onBind: [
      [BALANCE_SERVICE, ASSET_SERVICE, PRICE_SERVICE, 'onBind'],
    ],
  },
});

