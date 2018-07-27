import { Connector } from 'sources.js';
import { observer } from 'mobx-react';
import context from 'demo/platform/helper/context.js';
import balanceService from 'demo/platform/services/BalanceService/index.js';
import BalanceStore from 'demo/platform/containers/Balance/store/BalanceStore.js';
import Balance from 'demo/platform/components/Balance/index.jsx';


export default Connector(
  observer(Balance),
  {
    store() {
      return new BalanceStore(context);
    },
    helper(store) {
      return {
        balance: balanceService.balance,
        isRecharge: store.isRecharge,
        bonusPercent: store.bonusPercent,
        defaultAmount: store.defaultAmount,
      };
    },
  },
);

