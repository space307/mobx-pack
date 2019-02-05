

export default class PlatformApiMd {
  platformApi;
  constructor(platformApi) {
    this.platformApi = platformApi;
  }

  getAsset(){
    return this.platformApi.getAsset();
  }

/*  md = {};

  apply(middleware) {
    this.md = { ...this.md, ...middleware };
  }

  start(){

  }*/


}

