/* eslint-disable */

export default class InApi {

  start({middleware, store}){
    this.store = store;
  }

  setBalance(balance){
    if(balance && balance.usd){
      this.store.balance = balance.usd;
    }
  }

  setAsset(asset){
    if(asset){
      this.store.asset = asset.id;
    }
  }

  setPrice(price){
    this.store.price = price;
  }
}



