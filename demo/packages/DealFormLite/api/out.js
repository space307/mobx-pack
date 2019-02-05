/* eslint-disable */

export default class OutApi {
  constructor(middleware) {
    this.middleware = middleware;
  }

  getAsset(cb): void {
    return this.middleware.getAsset(cb);
  }

  selectAsset(asset){
    return this.middleware.selectAsset(asset);
  }

  subsBidPrice(cb){
    return this.middleware.subsBidPrice(cb);
  }

}


