/* eslint-disable */

export default class OutApi {

  start({middleware}){
    this.middleware = middleware;
  }

  sendAsset(asset){
    this.middleware.sendAsset(asset);
  }

  sendBalanceRequest(){
    this.middleware.sendBalanceRequest();
  }


}





