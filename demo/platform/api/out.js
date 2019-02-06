/* eslint-disable */

import apiMD from 'demo/platform/middleware/ApiMD.js';
import BusMD from 'demo/platform/middleware/BusMD.js';

class OutApi {

  constructor(middleware){
    this.middleware = middleware;
  }

  setDealFormAmount(amount) {
    this.middleware.setDealFormAmount(amount);
  }

}

export default new OutApi(BusMD);
