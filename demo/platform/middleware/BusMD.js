
import { PLATFORM_EVENTS, DEAL_FORM_LITE_EVENTS } from 'demo/packages/bus/busTypes.js';
import bus from 'demo/packages/bus/bus.js';
import inApi from 'demo/platform/api/in.js';

class BusMD {
  constructor(busParam, platformApi) {
    this.platformApi = platformApi;
    this.bus = busParam;

    this.platformApi.subsSelectedAsset((asset) => {
      this.bus.emit({
        type: PLATFORM_EVENTS.CURRENT_ASSET,
        payload: asset,
      });
    });


    this.platformApi.subsBidPrice((price) => {
      this.bus.emit({
        type: PLATFORM_EVENTS.CURRENT_PRICE,
        payload: price,
      });
    });

    this.platformApi.getBalance((balance) => {
      this.bus.emit({
        type: PLATFORM_EVENTS.CURRENT_BALANCE,
        payload: balance,
      });
    });
  }


  setDealFormAmount(amount) {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_AMOUNT,
      payload: amount,
    });
  }
}

export default new BusMD(bus, inApi);

