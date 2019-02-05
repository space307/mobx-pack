

export default class ApiMD {
  platformApi;
  constructor(platformApi) {
    this.platformApi = platformApi;
  }

  getAsset(cb) {
    this.platformApi.getAsset(cb);
  }

  selectAsset(asset) {
    this.platformApi.selectAsset(asset);
  }

  subsBidPrice(cb) {
    this.platformApi.subsBidPrice(cb);
  }

}

