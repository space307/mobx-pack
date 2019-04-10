// @flow
import Binder from '../Binder.js';

export type GlobalContextType = Binder;

export type ServiceConfigBindAsType = string;

export type ServiceConfigCallbackSetType = Array<string>;

export type InternalCallbackSetType = ServiceConfigCallbackSetType & {
  __locked?: boolean,
  __resolveTM?: TimeoutID
}

export type BinderConfigType = {
  bindAs: ServiceConfigBindAsType,
  onStart?: ServiceConfigCallbackSetType,
  onStop?: string,
  onBind?: Array<ServiceConfigCallbackSetType>,
  onUnbind?: Array<ServiceConfigCallbackSetType>,
  importData?: *,
  debug?: boolean
};

export type ServiceClassType = Class<*> & {
  binderConfig: BinderConfigType,
}

export type ServiceStartConfigType = {
  proto: ServiceClassType,
  protoAttrs?: Array<*>,
  binderConfig: BinderConfigType
}


export type StartServiceReturnType = {
  service: *,
  started: boolean,
  serviceStartConfig: ServiceStartConfigType,
};
