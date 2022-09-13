// @flow

import Binder from '../Binder.js';
import type {
  BinderConfigType,
} from './common.js';

export type ServiceConnectorOptionsTypes = {
  binder: Binder,
  initialState: *,
  config: BinderConfigType,
  onStart: Function | string,
  onStop: Function | string,
}
