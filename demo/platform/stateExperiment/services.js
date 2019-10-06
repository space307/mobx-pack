// @flow
import { observable, runInAction, reaction, computed } from 'mobx';
import { SERVICE_DESCRIPTORS, type TServiceDescriptors } from './constants.js';
import type { TAsset, TAccount, IAssetService, IAccountService, IState } from './types.js';


const testData: Array<TAsset> = [
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

export class AssetService implements IAssetService {
  static descriptor: TServiceDescriptors = SERVICE_DESCRIPTORS.ASSET;

  @observable
  collection: Array<TAsset> = [];
  @observable
  selectedId: string;

  @computed
  get selected():?TAsset {
    return this.collection.find(item => item.id === this.selectedId);
  }


  select(id: string): void {
    this.selectedId = id;
  }

  onStart(state: IState): void {
    state.asset = this;
  }

  onStop(state: IState): void {
    delete state.asset;
  }

  fetch(accountId: number): void {
    setTimeout(() => {
      runInAction(() => {
        this.collection = testData.filter(item => (item.accountId === accountId));
        this.select(this.collection[0].id);
      });
    }, 500);
  }
}

export class AssetMD {
  reactions = [];

  onStart(state: IState): void {
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

  initReaction(state: IState): void {
    this.reactions.push(
      reaction(
        () => state.account && state.account.selected && state.account.selected.id,
        (accountId: ?number): void => {
          if (accountId) {
            state.asset.fetch(accountId);
          }
        }, { fireImmediately: true },
      ),

    );
  }
}

export class AccountService implements IAccountService {
  static descriptor: TServiceDescriptors = SERVICE_DESCRIPTORS.ACCOUNT;

  @observable
  collection: Array<TAccount> = [{
    id: 1,
    sum: 30,
  },
  {
    id: 2,
    sum: 500,
  }];
  @observable
  selectedId: number;

  @computed
  get selected(): ?TAccount {
    return this.collection.find(item => item.id === this.selectedId);
  }


  select(id: number): void {
    this.selectedId = id;
  }

  onStart(state: IState): void {
    this.selectedId = 2;
    state.account = this;
  }
}
