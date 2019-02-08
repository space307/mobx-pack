import { observable, action } from 'mobx';
import { BaseStore } from 'sources.js';
import { RECHARGE_SERVICE, API_SERVICE }
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
    setDealFormAmount: this.setDealFormAmount,
  };

  setDealFormAmount() {
    this.callApi(API_SERVICE, 'setDealFormAmount', 1500);
  }

  @action initRecharge() {
    this.isRecharge = true;
  }

  @action recharge() {
    if (this.isRecharge) {
      this.callApi(RECHARGE_SERVICE, 'recharge', this.defaultAmount);
    }
  }
}

