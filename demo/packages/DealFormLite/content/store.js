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

  constructor(out) {
    this.out = out;

    this.out.subsBidPrice((price) => {
      this.price = price;
    });

    this.out.subsSelectedAsset(({ id }) => {
      this.asset = id;
    });
  }

  updateBalance() {
    this.out.getBalance((data) => {
      this.balance = data && data.usd;
    }, 'usd');
  }

  selectAsset(asset) {
    this.out.selectAsset(asset);
  }
}
