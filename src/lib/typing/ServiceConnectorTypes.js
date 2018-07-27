// @flow

import Binder from '../Binder.js';

export type ServiceConnectorOptionsTypes = {
  binder: Binder,
  config: {
    bindAs: string,
    onBind: Array<Array<string | Function>>,
  },
  onStart: Function | string,
  onStop: Function | string,
}
