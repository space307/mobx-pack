import { Connector } from 'sources.js';
import AssetService from 'demo/platform/services/AssetService/index.js';
import AssetSelector from 'demo/platform/components/AssetSelector/index.jsx';


export default Connector(
  AssetSelector,
  {
    helper() {
      return {
        assets: AssetService.assetCollection,
        selectedAsset: AssetService.selectedAsset,
      };
    },
  },
);

