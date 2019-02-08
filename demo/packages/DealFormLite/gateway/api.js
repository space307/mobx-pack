/* eslint-disable */
import Emitter from 'demo/packages/helper/helperClass/Emitter.js';

export default class Api {

  emitter = new Emitter();

  start({store}){
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

  setAmount(amount){
    this.store.amount = amount;
  }

  subsAssetRequest(cb){
    this.emitter.subscribe(this.subsAssetRequest, cb);
  }
  subsBalanceRequest(cb){
    this.emitter.subscribe(this.subsBalanceRequest, cb);
  }
}



