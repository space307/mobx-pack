import { BaseStore } from 'index.js';
import { observable, action } from 'mobx';
import { RECHARGE_SERVICE, BALANCE_SERVICE } from 'demo/platform/constants/moduleNames.js';
import { ASSET_NAMES } from 'demo/platform/constants/common.js';
import context from 'demo/platform/helper/context.js';
import serviceConnector from 'demo/platform/helper/serviceConnector.js';


export class RechargeService {

  api = {
    recharge: this.recharge,
  };

  @observable bonusPercent = 50;
  defaultAmount = 1000;
  onBind(rechargeService){
    this.rechargeService = rechargeService;
  }

  @action recharge(val) {
    const amount = val + parseInt((val / 100) * this.bonusPercent, 10);

    this.rechargeService.changeBalance({ [ASSET_NAMES.USD]: amount });
    //this.callApi(BALANCE_SERVICE, 'changeBalance', { [ASSET_NAMES.USD]: amount });
  }
}

const rechargeService = new RechargeService();
export default serviceConnector(rechargeService, {
  context,
  config: {
    bindAs:RECHARGE_SERVICE,
    onBind: [
      [BALANCE_SERVICE, rechargeService.onBind]
    ]
  }
});

