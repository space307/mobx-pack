import Emitter from 'demo/packages/helper/helperClass/Emitter.js';
import { DEAL_FORM_LITE_EVENTS, PLATFORM_EVENTS } from 'demo/packages/bus/busTypes.js';


export default class busMD {
  start({ bus }) {
    this.bus = bus;
  }


  getBalance(cb) {
    this.bus.select(PLATFORM_EVENTS.CURRENT_BALANCE).subscribe(({ payload }) => {
      cb(payload);
    });
  }


  getPrice(cb) {
    this.bus.select(PLATFORM_EVENTS.CURRENT_PRICE).subscribe(({ payload }) => {
      cb(payload);
    });
  }

  sendAsset(asset) {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_ASSET,
      payload: asset,
    });
  }
}
