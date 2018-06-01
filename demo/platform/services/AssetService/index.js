import { find } from 'lodash';
import { observable, action, computed } from 'mobx';
import { ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';
import { fetchAssets } from 'demo/platform/services/AssetService/client.js';
import serviceConnector from 'demo/platform/helper/serviceConnector.js';


export class AssetService {

  api = {
    selectAsset: this.selectAsset,
  };

  @observable assetCollection = [];

  @observable selectedAsset = 'gold';

  @computed get selectedAssetData() {
    return find(this.assetCollection, item => (item.id === this.selectedAsset));
  }


  onStart() {
    return fetchAssets().then((data) => {
      this.resetAssetCollection(data);
    });
  }

  @action resetAssetCollection(data) {
    this.assetCollection = data;
  }

  @action selectAsset(id) {
    this.selectedAsset = id;
  }
}


export default serviceConnector(new AssetService(), {
  context,
  config: {bindAs:ASSET_SERVICE}
});
