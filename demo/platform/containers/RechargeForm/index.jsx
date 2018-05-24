import { Connector } from 'index.js';
import context from 'demo/platform/helper/context.js';
import RechargeFormStore from 'demo/platform/containers/RechargeForm/store/RechargeFormStore.js';
import rechargeService from 'demo/platform/services/RechargeService/index.js';
import RechargeForm from 'demo/platform/components/RechargeForm/index.jsx';

export default Connector(
  RechargeForm,
  {
    store() {
      return new RechargeFormStore(context);
    },
    helper(store) {
      return {
        bonusPercent: rechargeService.bonusPercent,
        inFocus: store.inFocus,
        amount: store.amount,
      };
    },
    services: [rechargeService],
  },
);

