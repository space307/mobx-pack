

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
}

export default new OutApi();
