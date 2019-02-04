import { observable } from 'mobx';

export default class DealFormLiteStore {
  @observable
  rate = 1;
  @observable
  pair = 'EURTEST';
}
