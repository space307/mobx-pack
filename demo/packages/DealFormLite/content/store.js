import { observable } from 'mobx';

export default class DealFormLiteStore {
  @observable
  rate = 1;
  @observable
  pair = 'EURTEST';
  out;
  constructor(out) {
    this.out = out;
  }

  getAsset() {
    console.log([123, this.out.getAsset()]);
  }
}
