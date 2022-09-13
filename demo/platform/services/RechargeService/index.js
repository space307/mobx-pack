// @flow
import { ServiceConnector } from 'mobx-pack';
import { observable, action } from 'mobx';
import { RECHARGE_SERVICE, BALANCE_SERVICE } from 'demo/platform/constants/moduleNames.js';
import { ASSET_NAMES } from 'demo/platform/constants/common.js';
import context from 'demo/platform/helper/context.js';
import type { BalanceServiceInterface } from 'demo/platform/services/BalanceService/typing/interfaces.js';

export class RechargeService {
  api = {
    recharge: this.recharge,
  };

  @observable bonusPercent: number = 50;

  balanceService: ?BalanceServiceInterface = null;

  defaultAmount: number = 1000;
  onBind(balanceService: BalanceServiceInterface): void {
    this.balanceService = balanceService;
  }

  @action recharge(val: number) {
    const amount = val + parseInt((val / 100) * this.bonusPercent, 10);
    if (this.balanceService) {
      this.balanceService.changeBalance({ [ASSET_NAMES.USD]: amount });
    }
    // this.callApi(BALANCE_SERVICE, 'changeBalance', { [ASSET_NAMES.USD]: amount });
  }
}

const rechargeService = new RechargeService();
export default ServiceConnector(rechargeService, {
  binder: context.binder,
  config: {
    bindAs: RECHARGE_SERVICE,
    onBind: [
      [BALANCE_SERVICE, rechargeService.onBind],
    ],
  },
});

