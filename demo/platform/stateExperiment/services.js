import { observable, runInAction, reaction, computed } from 'mobx';

const testData = [
  {
    id: 'EURUSD',
    accountId: 1,
    locked: false,
  },
  {
    id: 'USDJPY',
    accountId: 1,
    locked: false,
  },
  {
    id: 'AUFUSD',
    accountId: 2,
    locked: false,
  },
  {
    id: 'Bitcoin',
    accountId: 2,
    locked: false,
  },
];

export class AssetService {
  @observable
  assets = [];
  @observable
  selectedId;

  @computed
  get selected() {
    return this.assets.find(item => item.id === this.selectedId);
  }


  select(id) {
    this.selectedId = id;
  }

  onStart(state) {
    state.asset = this;
  }

  onStop(state) {
    state.asset = null;
  }

  fetch(accountId) {
    setTimeout(() => {
      runInAction(() => {
        this.assets = testData.filter(item => (item.accountId === accountId));
        this.select(this.assets[0].id);
      });
    }, 500);
  }
}

export class AssetMD {
  reactions = [];

  onStart(state) {
    this.reactions.push(reaction(
      () => !!(state.account && state.asset),
      (ready) => {
        if (ready) {
          this.initReaction(state);
        }
      }, { fireImmediately: true },
    ),
    );
  }

  initReaction(state) {
    this.reactions.push(
      reaction(
        () => state.account.selected.id,
        (accountId) => {
          console.log([state.asset]);
          state.asset.fetch(accountId);
        }, { fireImmediately: true },
      ),

    );
  }
}

export class AccountService {
  @observable
  accounts = [{
    id: 1,
    sum: 30,
  },
  {
    id: 2,
    sum: 500,
  }];
  @observable
  selectedId;

  @computed
  get selected() {
    return this.accounts.find(item => item.id === this.selectedId);
  }


  select(id) {
    this.selectedId = id;
  }

  onStart(state) {
    this.selectedId = 2;
    state.account = this;
  }
}
