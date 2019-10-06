import { observable, runInAction, reaction } from 'mobx';

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
  selected;

  select(id) {
    this.selected = id;
  }

  fetch(accountId) {
    setTimeout(() => {
      runInAction(() => {
        this.assets = testData.filter(item => (item.accountId === accountId));
      });
    }, 500);
  }
}

export class AssetMD {
  reactions = [];


  onStart(state) {
    this.reactions.push(reaction(
      () => this.state.account && this.state.assets,
      (ready) => {
        if (ready) {
          this.initReaction(state);
        }
      },
    ),
    );
  }

  initReaction(state) {
    this.reactions.push(
      reaction(
        () => state.account.selected.id,
        (accountId) => {
          state.assets.fetch(accountId);
        },
      ),

    );
  }
}
