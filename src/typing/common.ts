import type { Binder } from '../Binder';

export type Constructor<Instance extends object = object, Args extends any[] = any[]> = {
  new (...args: Args): Instance;
};

export type ServiceConfigBindAs = string;

export type ServiceConfigCallbackSet = string[];

export type InternalCallbackSetType = ServiceConfigCallbackSet & {
  __locked?: boolean;
  __resolveTM?: ReturnType<typeof setTimeout>;
};

export type BinderConfig = {
  bindAs: ServiceConfigBindAs;
  onStart?: InternalCallbackSetType;
  onStop?: string;
  onBind?: InternalCallbackSetType[];
  onUnbind?: InternalCallbackSetType[];
  importData?: Record<string, Record<string, string>>;
  debug?: boolean;
  exportData?: Record<string, unknown>;
};

export type BindableEntityStartConfig<
  T extends object = object,
  A extends unknown[] = unknown[],
> = {
  factory?: (() => T) | null;
  proto: Constructor<T, A>;
  protoAttrs: A;
  binderConfig: BinderConfig;
};

export type StartBindableEntityResult<
  T extends object = object,
  A extends unknown[] = unknown[],
> = {
  service: T;
  started: boolean;
  serviceStartConfig: BindableEntityStartConfig<T, A>;
};

export type BindableEntityConfig = {
  bindAs?: ServiceConfigBindAs;
  importData?: Record<string, Record<string, unknown>>;
  exportData?: Record<string, unknown>;
  waitFor?: ServiceConfigBindAs[];
  autoBind?: boolean;
  unstoppable?: boolean;
};

export interface BindableEntity {
  config?: BindableEntityConfig;
  api?: Record<string, (...args: unknown[]) => void>;

  start: (initiatorId: string) => Promise<unknown>;
  stop?: () => Promise<unknown> | void;
  onStart?: (...args: any[]) => boolean | Promise<boolean>;
  onStop?: () => void;
  __serviceOptions: {
    started: boolean;
  };
}

export type BindableEntityConstructor<T extends BindableEntity = BindableEntity> =
  Constructor<T> & {
    binderConfig: BinderConfig;
  };

export type ServiceConnectorOptions = {
  binder: Binder;
  initialState: any;
  config: BinderConfig;
  onStart: ((...args: any[]) => Promise<boolean>) | string;
  onStop: ((...args: any[]) => any) | string;
};
