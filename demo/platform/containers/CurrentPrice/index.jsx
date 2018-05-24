import { Connector } from 'index.js';
import CurrentPrice from 'demo/platform/components/CurrentPrice/index.jsx';
import PriceService from 'demo/platform/services/PriceService/index.js';
import AssetService from 'demo/platform/services/AssetService/index.js';


export default Connector(
  CurrentPrice,
  {
    helper() {
      return {
        bid: PriceService.bidPrice,
        ask: PriceService.askPrice,
        asset: AssetService.selectedAsset,
      };
    },
  },
);

