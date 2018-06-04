// @flow
import type { DealType } from 'demo/platform/services/DealService/typing/types.js';

export interface DealServiceInterface {
  deals: Array<DealType>,
  +makeDeal:(data: *)=> boolean
}
