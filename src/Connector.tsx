import * as React from 'react';
import { useState, useMemo, useEffect, useReducer } from 'react';
import { observer } from 'mobx-react';
import type { BaseStore } from './BaseStore.js';
import type { BindableEntity } from './typing/common.js';
import { getUid, protoName } from './helper/util.js';

type ConnectorOptions<Store extends BaseStore, AdditionalProps extends object = object> = {
  store?: () => Store;
  helper?: (store: Store) => AdditionalProps;
  services: BindableEntity[];
  preLoader?: React.ComponentType | null;
  waitForServices?: boolean;
};

function useForceUpdateWithCache(): [number, () => void] {
  return useReducer((x: number) => (x === Number.MAX_SAFE_INTEGER ? 0 : x + 1), 0);
}

function useForceUpdate(): () => void {
  const [, forceUpdate] = useForceUpdateWithCache();
  return forceUpdate;
}

export function Connector<
  AdditionalProps extends object,
  Store extends BaseStore,
  Props extends Omit<object, keyof AdditionalProps>,
>(Component: React.ComponentType<Props>, opt: ConnectorOptions<Store, AdditionalProps>) {
  const options: ConnectorOptions<Store, AdditionalProps> = {
    preLoader: null,
    waitForServices: true,
    ...opt,
  };

  const composeProps = (props: Props, store: Store): Props & AdditionalProps => {
    const baseProps = Object.entries(props).reduce<Props>((acc, [key, value]) => {
      if (key !== 'store') {
        // @ts-expect-error Let's type it later
        acc[key] = value;
      }

      return acc;
    }, {} as Props);

    if (options.helper) {
      const additionalProps = options.helper(store);
      Object.keys(additionalProps).forEach(key => {
        if (key in baseProps) {
          console.warn(
            `Connector. For "${Component.name}" variable name "${key}" exists in the helper and props.`,
          );
        }
      });

      return {
        ...baseProps,
        ...additionalProps,
      };
    }

    return baseProps as Props & AdditionalProps;
  };

  // eslint-disable-next-line react/function-component-definition
  const WrapperComponent: React.FunctionComponent<Props & { store?: Store }> = props => {
    const forceUpdate = useForceUpdate();
    const componentId = useMemo(() => `${Component.name}_${getUid()}`, [Component]);
    const [resolvedStore, setResolvedStore] = useState<Store | null>(null);
    const [servicesLoaded, setServicesLoaded] = useState(true);
    const [resolvedApi, setResolvedApi] = useState({});

    useEffect(() => {
      function resolveStore(store: Store | (() => Store)) {
        const resolved = typeof store === 'function' ? store() : store;

        if (typeof store === 'function' && !resolved) {
          console.warn(`Connector. In component "${Component.name}" store not resolved"`);
        }

        setResolvedStore(resolved);
        return resolved;
      }

      function resolveApi(store: Store) {
        const api = {};

        if (store && store.api) {
          Object.entries(store.api).forEach(([key, apiMethod]) => {
            if (typeof apiMethod === 'function') {
              // @ts-expect-error unfixable
              api[key] = store.callApi
                ? (...arg: unknown[]) =>
                    // @ts-expect-error unfixable
                    store.binder?.callApi(store.getConfig().bindAs, key, componentId, ...arg)
                : apiMethod.bind(store);
            } else {
              console.warn(
                `Connector. For "${
                  Component.name
                }" api function "${key}" not found in store "${protoName(store)}"`,
              );
            }
          });
          setResolvedApi(api);
        }
      }

      function initComponent() {
        setServicesLoaded(true);
        setResolvedApi({});

        // eslint-disable-next-line
        // @ts-expect-error wtf
        const store = resolveStore(options.store || props.store);

        if (store) {
          void store.start(componentId);
        }

        resolveApi(store);
      }

      if (options.services.length) {
        void Promise.all(options.services.map(service => service.start(componentId))).then(() => {
          initComponent();

          if (options.waitForServices) {
            forceUpdate();
          }
        });
      }

      if (!options.services.length || !options.waitForServices) {
        initComponent();
      }

      return () => {
        if (resolvedStore) {
          if (typeof resolvedStore.destroy === 'function') {
            resolvedStore.destroy();
          }
          void resolvedStore.stop(componentId);
        }

        if (options.services) {
          options.services.forEach(service => {
            if (!service.config || !service.config.unstoppable) {
              void service.stop?.(componentId);
            }
          });
        }
      };
    }, []);

    if (options.waitForServices && !servicesLoaded) {
      const Preloader = options.preLoader;
      return typeof Preloader === 'function' ? <Preloader /> : Preloader ?? null;
    }

    const normalizedProps = resolvedStore ? composeProps(props, resolvedStore) : void 0;

    if (normalizedProps !== void 0) {
      if (resolvedApi) {
        // @ts-expect-error don't know what is it
        normalizedProps.api = resolvedApi;
      }
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Component {...normalizedProps} />;
    }

    const Preloader = options.preLoader;
    return typeof Preloader === 'function' ? <Preloader /> : null;
  };

  WrapperComponent.displayName =
    (Component.displayName && `Connector(${Component.displayName})`) ||
    `Connector(${Component.name})`;

  return observer(WrapperComponent);
}
