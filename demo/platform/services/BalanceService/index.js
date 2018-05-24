import { BaseStore } from 'index.js';
import { observable, action } from 'mobx';
import { BALANCE_SERVICE } from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';
import { ASSET_NAMES } from 'demo/platform/constants/common.js';


function validateBalanceChange(balance, data) {
  let result = true;

  Object.keys(data).forEach((asset) => {
    const val = data[asset];

    if (typeof val !== 'number') {
      result = 'Wrong format';
    } else if (val === 0) {
      result = 'Wrong operation with 0';
    } else if (balance[asset] + val < 0) {
      result = 'Not enough funds for operation';
    }
  });


  return result;
}

export class BalanceService extends BaseStore {
  config = {
    bindAs: BALANCE_SERVICE,
    exportData: {
      balance: 1,
    },
  };

  api = {
    changeBalance: this.changeBalance,
  };

  @observable balance = {
    [ASSET_NAMES.USD]: 1000,
    [ASSET_NAMES.GOLD]: 0,
    [ASSET_NAMES.OIL]: 0,
  };

  @action changeBalance(data) {
    const result = validateBalanceChange(this.balance, data);

    if (result === true) {
      Object.keys(data).forEach((asset) => {
        this.balance[asset] += data[asset];
      });
    }
    return result;
  }
}


export default new BalanceService(context);
