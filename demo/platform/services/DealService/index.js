// @flow
import { BaseStore } from 'mobx-pack';
import { observable, action } from 'mobx';
import { DEAL_SERVICE, BALANCE_SERVICE } from 'demo/platform/constants/moduleNames.js';
import { DEAL_TYPE, ASSET_NAMES } from 'demo/platform/constants/common.js';
import context from 'demo/platform/helper/context.js';
import type { DealType } from 'demo/platform/services/DealService/typing/types.js';
import type { DealServiceInterface } from 'demo/platform/services/DealService/typing/interfaces.js';


export class DealService extends BaseStore implements DealServiceInterface{
  config = {
    bindAs: DEAL_SERVICE,
    importData: {
      [BALANCE_SERVICE]: {
        balance: 'balance',
      },
    },
    exportData: {
      deals: 1,
    },
  };

  api = {
    makeDeal: this.makeDeal,
  };

  @observable deals: Array<DealType> = [];


  onStart() {
    return true;
  }

  @action makeDeal(data: *): boolean {
    const deal = { ...{ id: this.deals.length }, ...data };
    let result = true;
    const {
      asset, quantity, bidPrice, askPrice,
    } = deal;

    const sum = quantity * (data.type === DEAL_TYPE.BUY ? askPrice : bidPrice);

    result = this.callApi(
      BALANCE_SERVICE, 'changeBalance',
      {
        [ASSET_NAMES.USD]: data.type === DEAL_TYPE.BUY ? -sum : sum,
        [asset]: quantity,

      },
    );

    if (result === true) {
      this.deals.push(deal);
    }

    return result;
  }
}


export default new DealService(context);
