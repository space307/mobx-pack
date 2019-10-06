// @flow

export type TAsset = {
  id: string,
  accountId: number,
  locked: boolean,
}
export type TAccount = {
  id: number,
  sum: number,
}
export interface IAssetService {
  collection: Array<TAsset>;
  selectedId: string;
  +selected:?TAsset;
  select(id: string): void;
  fetch(accountId: number): void;
}
export interface IAccountService {
  collection: Array<TAccount>;
  selectedId: number;
  select(id: number): void;
  +selected:?TAccount;
}

export interface IState {
  asset: IAssetService;
  account: IAccountService;
}
