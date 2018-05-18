import { find } from 'lodash';
import { observable, action, computed } from 'mobx';
import { BaseStore } from 'mobx-pack';
import { ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';
import { fetchAssets } from 'demo/platform/services/AssetService/client.js';


export class AssetService extends BaseStore {
  config = {
    bindAs: ASSET_SERVICE,
    exportData: {
      assetCollection: 1,
      selectedAsset: 1,
      selectedAssetData: 1,
    },
  };

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

export default new AssetService(context);
