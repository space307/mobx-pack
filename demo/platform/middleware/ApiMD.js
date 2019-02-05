

class ApiMD {
  api = {};

  apply(api) {
    this.api = { ...api };
  }

  setDealFormAmount(amount) {
    this.api.DealFormLite.setAmount(amount);
  }
}

export default new ApiMD();

