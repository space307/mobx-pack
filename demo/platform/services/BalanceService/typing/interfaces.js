// @flow

export interface BalanceServiceInterface {
  balance: {[key: string]: number},
  +changeBalance:(data: {[key: string]: number})=> boolean | string
}
