import { PLATFORM_EVENTS, DEAL_FORM_LITE_EVENTS } from 'demo/packages/bus/busTypes.js';


export default class BusMD {
  start({ bus, api }) {
    this.bus = bus;
    this.api = api;

    this.getAsset();
    this.getBalanceRequest();

    api.subsPrice(this.subsPrice);
    api.subsAsset(this.subsAsset);
    api.subsDealFormAmount(this.subsDealFormAmount);
  }

  getBalanceRequest() {
    this.bus.select(PLATFORM_EVENTS.GET_BALANCE).subscribe(() => {
      this.api.getBalance((balance) => {
        this.sendBalance(balance);
      });
    });
  }

  sendBalance(balance) {
    this.bus.emit({
      type: PLATFORM_EVENTS.CURRENT_BALANCE,
      payload: balance,
    });
  }

  subsPrice = (price) => {
    this.bus.emit({
      type: PLATFORM_EVENTS.CURRENT_PRICE,
      payload: price,
    });
  };

  subsAsset = (asset) => {
    this.bus.emit({
      type: PLATFORM_EVENTS.CURRENT_ASSET,
      payload: asset,
    });
  };

  subsDealFormAmount = (amount) => {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_AMOUNT,
      payload: amount,
    });
  };

  getAsset() {
    this.bus.select(DEAL_FORM_LITE_EVENTS.SET_ASSET).subscribe(({ payload }) => {
      this.api.setAsset(payload);
    });
  }
}
