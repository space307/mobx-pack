// @flow
import Binder from '../Binder.js';


export type GlobalContextType = {
  binder: Binder,
  initialState: *,
};

export type ServiceConfigType = {
  onStart?: string,
  onStop?: string,
  config: {
    bindAs: string,
    onBind?: Array<Array<string>>,
    onUnbind?: Array<Array<string>>,
  },
};

export type ServiceClassType = Class<*> & {
  binderConfig: ServiceConfigType,
  name: string,
  constructor: ()=>void,
}

export type ServiceStartConfigType = {
  proto: ServiceClassType,
  protoAttrs?: Array<*>,
  binderConfig: ServiceConfigType
}


export type StartServiceReturnType = {
  service: *,
  started: boolean,
  serviceStartConfig: ServiceStartConfigType,
};
