import { observable } from 'mobx';
import { DEAL_FORM_LITE_EVENTS, PLATFORM_EVENTS } from 'demo/packages/bus/busTypes.js';

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

  constructor({ bus }) {
    this.bus = bus;

    this.bus.select(PLATFORM_EVENTS.CURRENT_BALANCE).subscribe(({ payload }) => {
      this.setBalance(payload.usd);
    });

    this.bus.select(PLATFORM_EVENTS.CURRENT_PRICE).subscribe(({ payload }) => {
      this.setPrice(payload);
    });

    this.bus.select(PLATFORM_EVENTS.CURRENT_ASSET).subscribe(({ payload }) => {
      this.setAsset(payload.id);
    });

    this.bus.select(DEAL_FORM_LITE_EVENTS.SET_AMOUNT).subscribe(({ payload }) => {
      this.setAmount(payload);
    });
  }

  updateBalance() {
    this.bus.emit({
      type: PLATFORM_EVENTS.GET_BALANCE,
    });
  }

  setPrice(price) {
    this.price = price;
  }

  setBalance = (balance) => {
    this.balance = balance;
  };

  setAsset = (asset) => {
    this.asset = asset;
  };

  setAmount = (amount) => {
    this.amount = amount;
  };

  api = {
    setAmount: this.setAmount,
    setBalance: this.setBalance,
    setAsset: this.setAsset,
  };

  selectAsset(asset) {
    this.bus.emit({
      type: DEAL_FORM_LITE_EVENTS.SET_ASSET,
      payload: asset,
    });
  }
}
