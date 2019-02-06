

export default class ApiMD {
  platformApi;
  constructor(platformApi) {
    this.platformApi = platformApi;
  }

  getBalance(cb, type) {
    this.platformApi.getBalance(cb, type);
  }

  selectAsset(asset) {
    this.platformApi.selectAsset(asset);
  }

  subsBidPrice(cb) {
    this.platformApi.subsBidPrice(cb);
  }

  subsSelectedAsset(cb){
    this.platformApi.subsSelectedAsset(cb);
  }

}

