// @flow
import type { AssetType } from './types';

export interface AssetServiceInterface {
  assetCollection: Array<AssetType>,
  selectedAsset: string,
  +selectedAssetData: ?AssetType,
  +selectAsset:(id: string)=>void,

}
