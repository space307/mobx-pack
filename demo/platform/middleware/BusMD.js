import { PLATFORM_EVENTS, DEAL_FORM_LITE_EVENTS } from 'demo/packages/bus/busTypes.js';


export default class BusMD {
  start({ bus, inApi }) {
    this.bus = bus;
    this.inApi = inApi;

    this.getAsset();
    this.getBalanceRequest();
  }

  getBalanceRequest() {
    this.bus.select(PLATFORM_EVENTS.GET_BALANCE).subscribe(() => {
      this.inApi.getBalance((balance) => {
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

  sendPrice(price) {
    this.bus.emit({
      type: PLATFORM_EVENTS.CURRENT_PRICE,
      payload: price,
    });
  }

  sendAsset(asset) {
    this.bus.emit({
      type: PLATFORM_EVENTS.CURRENT_ASSET,
      payload: asset,
    });
  }

  sendDealFormAmount(amount){
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_AMOUNT,
      payload: amount,
    });
  }

  getAsset() {
    this.bus.select(DEAL_FORM_LITE_EVENTS.SET_ASSET).subscribe(({ payload }) => {
      this.inApi.setAsset(payload);
    });
  }
}
