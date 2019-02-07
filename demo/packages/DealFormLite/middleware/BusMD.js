import { DEAL_FORM_LITE_EVENTS, PLATFORM_EVENTS } from 'demo/packages/bus/busTypes.js';


export default class busMD {
  start({ bus, inApi }) {
    this.bus = bus;
    this.inApi = inApi;

    this.getBalance();
    this.getPrice();
    this.getAsset();
    this.getDealFormAmount();
  }

  sendBalanceRequest() {
    this.bus.emit({
      type: PLATFORM_EVENTS.GET_BALANCE,
    });
  }

  getBalance() {
    this.bus.select(PLATFORM_EVENTS.CURRENT_BALANCE).subscribe(({ payload }) => {
      this.inApi.setBalance(payload);
    });
  }

  getPrice() {
    this.bus.select(PLATFORM_EVENTS.CURRENT_PRICE).subscribe(({ payload }) => {
      this.inApi.setPrice(payload);
    });
  }

  getAsset() {
    this.bus.select(PLATFORM_EVENTS.CURRENT_ASSET).subscribe(({ payload }) => {
      this.inApi.setAsset(payload);
    });
  }
  getDealFormAmount() {
    this.bus.select(DEAL_FORM_LITE_EVENTS.SET_AMOUNT).subscribe(({ payload }) => {
      this.inApi.setAmount(payload);
    });
  }

  sendAsset(asset) {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_ASSET,
      payload: asset,
    });
  }
}
