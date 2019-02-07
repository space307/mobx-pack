/* eslint-disable */

export default class InApi {

  start({middleware, store}){
    this.store = store;
  }

  setBalance(balance){
    this.store.balance = balance;
  }

  setPrice(price){
    this.store.price = price;
  }
}



