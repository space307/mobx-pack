import { observable, action } from 'mobx';
import { BaseStore } from 'sources.js';
import { RECHARGE_SERVICE, RECHARGE_FORM_STORE }
  from 'demo/platform/constants/moduleNames.js';


export default class DealFormStore extends BaseStore {
  config = {
    bindAs: RECHARGE_FORM_STORE,
    importData: {
      [RECHARGE_SERVICE]: {
        defaultAmount: 'defaultAmount',
      },
    },
  };

  api = {
    recharge: this.recharge,
    focusRecharge: this.focusRecharge,
    setDefaultAmount: this.setDefaultAmount,
  };

  @observable inFocus;
  @observable amount = 0;

  @action recharge(val) {
    this.callApi(RECHARGE_SERVICE, 'recharge', val);
  }

  @action focusRecharge() {
    this.inFocus = new Date().getTime();
  }

  @action setDefaultAmount() {
    this.amount = this.defaultAmount;
  }
}

