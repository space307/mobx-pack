import type { ServiceConfigBindAsType, InternalCallbackSetType } from './common.js';

export interface BinderInterface {
  bind(store: *, options: InternalCallbackSetType): void;
  isBind(bindAs: ServiceConfigBindAsType): boolean;
  unbind(bindAs: ServiceConfigBindAsType): void;
  clear(): void;
  getStore(bindAs: ServiceConfigBindAsType): *;
}
