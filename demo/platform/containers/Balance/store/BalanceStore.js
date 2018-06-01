import { observable, action } from 'mobx';
import { BaseStore } from 'index.js';
import { RECHARGE_SERVICE }
  from 'demo/platform/constants/moduleNames.js';

export default class BalanceStore extends BaseStore {
  config = {
    bindAs: ' BalanceStore',

    onBind: [[RECHARGE_SERVICE, () => {
      this.initRecharge();
    }]],
    importData: {
      [RECHARGE_SERVICE]: {
        bonusPercent: 'bonusPercent',
        defaultAmount: 'defaultAmount',
      },
    },
  };

  @observable isRecharge = false;

  api = {
    recharge: this.recharge,
  };

  @action initRecharge() {
    this.isRecharge = true;
  }

  @action recharge() {
    if (this.isRecharge) {
      //this.callApi(RECHARGE_SERVICE, 'recharge', this.defaultAmount);
    }
  }
  /*

   @action recharge() {
    if (this.rechargeService) {
      this.rechargeService.recharge(this.rechargeService.defaultAmount)
    }
  }
   */
}

