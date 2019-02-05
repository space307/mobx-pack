import { observable } from 'mobx';

export default class DealFormLiteStore {
  @observable
  price = 1;
  @observable
  asset = 'EURTEST';
  @observable
  amount = 100;
  out;

  constructor(out) {
    this.out = out;

    this.out.subsBidPrice((price) => {
      this.price = price;
    });
  }

  getAsset() {
    this.out.getAsset((data) => {
      this.asset = data;
    });
  }

  selectAsset(asset) {
    this.out.selectAsset(asset);
  }
}
