

class OutApi {
  start({ middleware }) {
    this.middleware = middleware;
  }

  sendPrice(price) {
    this.middleware.sendPrice(price);
  }
}

export default new OutApi();
