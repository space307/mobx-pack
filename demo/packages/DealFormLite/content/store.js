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


  start({ api }) {
    this.api = api;
  }

  updateBalance() {
    this.api.emitter.emit(this.api.subsBalanceRequest);
  }

  selectAsset(asset) {
    this.api.emitter.emit(this.api.subsAssetRequest, asset);
  }
}
