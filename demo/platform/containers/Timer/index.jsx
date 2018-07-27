import { Connector } from 'sources.js';
import Timer from 'demo/platform/components/Timer/index.jsx';

export default Connector(
  Timer,
  {
    helper(store) {
      return {
        time: store.time,
      };
    },
  },
);

