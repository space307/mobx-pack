import { assetCollection } from 'demo/platform/services/AssetService/__mocks__/assetService.js';

export function fetchAssets() {
  return new Promise((resolve) => {
    resolve(assetCollection);
  });
}

export default fetchAssets;
