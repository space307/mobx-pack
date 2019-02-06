/* eslint-disable */


class OutApi {

  start({middleware}){
    //this.context = context;
    this.middleware = middleware;

  }

  sendBalance(balance) {
    this.middleware.sendBalance(balance);
  }

  sendPrice(price){
    this.middleware.sendPrice(price);
  }

}

export default new OutApi();
