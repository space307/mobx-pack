/* eslint-disable */

export default class OutApi {
  constructor(middleware) {
    this.middleware = middleware;
  }

  getBalance(cb, type): void {
    return this.middleware.getBalance(cb, type);
  }

  selectAsset(asset){
    return this.middleware.selectAsset(asset);
  }

  subsBidPrice(cb){
    return this.middleware.subsBidPrice(cb);
  }

  subsSelectedAsset(cb){
    return this.middleware.subsSelectedAsset(cb);
  }

}


