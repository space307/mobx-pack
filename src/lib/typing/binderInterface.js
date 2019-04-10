import type { ServiceConfigBindAsType, InternalCallbackSetType } from './common.js';

export interface BinderInterface {
  bind(service: *, options: InternalCallbackSetType): void;
  isBind(bindAs: ServiceConfigBindAsType): boolean;
  unbind(bindAs: ServiceConfigBindAsType): void;
  clear(): void;
  getService(bindAs: ServiceConfigBindAsType): *;
  getPendingStartResolver(bindAs:ServiceConfigBindAsType): ?Promise<*>;
  setPendingStartResolver(bindAs:ServiceConfigBindAsType, resolver: ?Promise<*>): void;
}
