// @flow
import { find } from 'lodash';
import { observable, action, computed } from 'mobx';
import { ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';
import { fetchAssets } from 'demo/platform/services/AssetService/client.js';
import { serviceConnector } from 'index.js';
import type { AssetType } from 'demo/platform/services/AssetService/typing/types.js';
import type { AssetServiceInterface } from 'demo/platform/services/AssetService/typing/interfaces.js';


export class AssetService implements AssetServiceInterface {
  api = {
    selectAsset: this.selectAsset,
  };

  @observable assetCollection: Array<AssetType> = [];

  @observable selectedAsset: string = 'gold';

  @computed get selectedAssetData(): ? AssetType {
    return find(this.assetCollection, item => (item.id === this.selectedAsset));
  }


  onStart(): Promise<*> {
    return fetchAssets().then((data: Array<AssetType>): void => {
      this.resetAssetCollection(data);
    });
  }

  @action resetAssetCollection(data: Array<AssetType>) {
    this.assetCollection = data;
  }

  @action selectAsset(id: string) {
    this.selectedAsset = id;
  }
}


export default serviceConnector(new AssetService(), {
  context,
  config: { bindAs: ASSET_SERVICE },
});
