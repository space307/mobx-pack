import Emitter from 'demo/packages/helper/helperClass/Emitter.js';
import { DEAL_FORM_LITE_EVENTS, PLATFORM_EVENTS } from 'demo/packages/bus/busTypes.js';


export default class busMD {
  emitter = new Emitter();

  constructor(bus) {
    this.bus = bus;
  }

  apply(api) {
    this.api = { ...api };

    this.bus.select(DEAL_FORM_LITE_EVENTS.SET_AMOUNT).subscribe(({ payload }) => {
      this.api.InApi.setAmount(payload);
    });
  }

  getBalance(cb) {
    this.bus.select(PLATFORM_EVENTS.CURRENT_BALANCE).subscribe(({ payload }) => {
      cb(payload);
    });
  }

  selectAsset(asset) {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_AMOUNT,
      payload: asset,
    });
  }

  subsBidPrice(cb) {
    this.bus.select(PLATFORM_EVENTS.CURRENT_PRICE).subscribe(({ payload }) => {
      cb(payload);
    });
  }

  subsSelectedAsset(cb) {
    this.bus.select(PLATFORM_EVENTS.CURRENT_ASSET).subscribe(({ payload }) => {
      cb(payload);
    });
  }
}
