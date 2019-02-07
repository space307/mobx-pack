import { observable } from 'mobx';

export default class DealFormLiteStore {
  @observable
  balance = 0;
  @observable
  price = 1;
  @observable
  asset = '';
  @observable
  amount = 100;
  out;


  start({ outApi }) {
    this.outApi = outApi;
  }

  updateBalance() {
    this.outApi.sendBalanceRequest();
  }

  selectAsset(asset) {
    this.outApi.sendAsset(asset);
  }
}
