import { Connector } from 'mobx-pack';
import DealBlock from 'demo/platform/components/DealBlock/index.jsx';


export default Connector(
  DealBlock,
  {
    helper(store) {
      return {
        quantity: store.quantity,
        isRecharge: store.isRecharge,
      };
    },
  },
);

