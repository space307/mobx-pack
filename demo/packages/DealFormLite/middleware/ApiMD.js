

export default class ApiMD {
  api = {};

  constructor(platformApi) {
    this.apply({ platformApi });
  }

  apply(api) {
    this.api = { ...this.api, ...api };
  }

  getBalance(cb, type) {
    this.api.platformApi.getBalance(cb, type);
  }

  selectAsset(asset) {
    this.api.platformApi.selectAsset(asset);
  }

  subsBidPrice(cb) {
    this.api.platformApi.subsBidPrice(cb);
  }

  subsSelectedAsset(cb) {
    this.api.platformApi.subsSelectedAsset(cb);
  }
}

