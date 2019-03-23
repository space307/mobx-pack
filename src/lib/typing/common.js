// @flow
import Binder from '../Binder.js';

export type GlobalContextType = {
  binder: Binder,
  initialState: *,
};


export type ServiceConfigBindAsType = string;

export type ServiceConfigCallbackSetType = Array<string>;

export type InternalCallbackSetType = ServiceConfigCallbackSetType & {
  __locked?: boolean,
  __resolveTM?: TimeoutID
}

export type BinderConfigType = {
  bindAs: ServiceConfigBindAsType,
  onBind?: Array<ServiceConfigCallbackSetType>,
  onUnbind?: Array<ServiceConfigCallbackSetType>,
  importData?: *,
  debug?: boolean
};

export type ServiceConfigType = {
  onStart?: string,
  onStop?: string,
  config: BinderConfigType,
};

export type ServiceClassType = Class<*> & {
  binderConfig: ServiceConfigType,
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
