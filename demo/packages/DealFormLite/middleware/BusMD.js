import { DEAL_FORM_LITE_EVENTS, PLATFORM_EVENTS } from 'demo/packages/bus/busTypes.js';


export default class busMD {
  start({ bus, inApi }) {
    this.bus = bus;
    this.inApi = inApi;

    this.getBalance();
    this.getPrice();
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

  sendAsset(asset) {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_ASSET,
      payload: asset,
    });
  }
}
