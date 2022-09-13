import type { ServiceConfigBindAsType, InternalCallbackSetType, ServiceStartConfigType } from './common.js';

export interface BinderInterface {
  bind(service: *, options: InternalCallbackSetType): void;

  isBind(bindAs: ServiceConfigBindAsType): boolean;

  unbind(bindAs: ServiceConfigBindAsType): void;

  clear(): void;

  getService(bindAs: ServiceConfigBindAsType): *;

  getPendingStartResolver(bindAs: ServiceConfigBindAsType): ?Promise<*>;

  setPendingStartResolver(bindAs: ServiceConfigBindAsType, resolver: ?Promise<*>): void;

  start(
    serviceStartConfig: ServiceStartConfigType,
  ): Promise<*>;

  stop(serviceStartConfig: ServiceStartConfigType): void;
}
