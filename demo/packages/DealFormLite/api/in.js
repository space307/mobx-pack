/* eslint-disable */

export default class InApi {

  start({middleware, store}){
    this.middleware = middleware;
    this.store = store;
    this.getBalance();
    this.getPrice();
  }

  getBalance(){
    this.middleware.getBalance((balance)=>{
      this.store.balance = balance;
      console.log(['balance', balance]);
    });
  }

  getPrice(){
    this.middleware.getPrice((price)=>{
      this.store.price = price;
    });
  }
}



