// @flow
import { BaseStore } from 'mobx-pack';
import { BASE_SERVICE } from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';


export class BaseService extends BaseStore {
  config = {
    bindAs: BASE_SERVICE,
    exportData: { serverTimeDelta: 1 },
  };
  // difference between server and local time in milliseconds, would get with initial request
  serverTimeDelta: number = 1;
}

export default new BaseService(context);
