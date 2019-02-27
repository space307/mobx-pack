// @flow
import Binder from '../Binder.js';


export type GlobalContextType = {
  binder: Binder,
  initialState: *,
};

export type ServiceConfigType<serviceClassType> = {
  proto: serviceClassType,
  protoAttrs?: Array<*>,
  onStart?: string,
  onStop?: string,
  config: {
    bindAs: string,
    onBind?: Array<Array<string>>,
    onUnbind?: Array<Array<string>>,
  },
};

