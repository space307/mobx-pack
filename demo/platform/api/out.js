

class OutApi {
  start({ middleware }) {
    this.middleware = middleware;
  }

  sendPrice(price) {
    this.middleware.sendPrice(price);
  }

  sendAsset(asset) {
    this.middleware.sendAsset(asset);
  }

  sendDealFormAmount(amount) {
    this.middleware.sendDealFormAmount(amount);
  }
}

export default new OutApi();
