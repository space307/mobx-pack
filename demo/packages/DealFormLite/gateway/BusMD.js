import { DEAL_FORM_LITE_EVENTS, PLATFORM_EVENTS } from 'demo/packages/bus/busTypes.js';


export default class busMD {
  start({ bus, api }) {
    this.bus = bus;
    this.api = api;
    this.getBalance();
    this.getPrice();
    this.getAsset();
    this.getDealFormAmount();

    api.subsAssetRequest(this.subsAssetRequest);
    api.subsBalanceRequest(this.subsBalanceRequest);
  }

  subsAssetRequest = (asset) => {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_ASSET,
      payload: asset,
    });
  };

  subsBalanceRequest = () => {
    this.bus.emit({
      type: PLATFORM_EVENTS.GET_BALANCE,
    });
  };


  getBalance() {
    this.bus.select(PLATFORM_EVENTS.CURRENT_BALANCE).subscribe(({ payload }) => {
      this.api.setBalance(payload);
    });
  }

  getPrice() {
    this.bus.select(PLATFORM_EVENTS.CURRENT_PRICE).subscribe(({ payload }) => {
      this.api.setPrice(payload);
    });
  }

  getAsset() {
    this.bus.select(PLATFORM_EVENTS.CURRENT_ASSET).subscribe(({ payload }) => {
      this.api.setAsset(payload);
    });
  }
  getDealFormAmount() {
    this.bus.select(DEAL_FORM_LITE_EVENTS.SET_AMOUNT).subscribe(({ payload }) => {
      this.api.setAmount(payload);
    });
  }
}
