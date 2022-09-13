import * as React from 'react';
import {
  useState, useMemo, useEffect, useReducer, useContext,
} from 'react';
import { observer } from 'mobx-react';
import { getUid, protoName } from './helper/util.js';

function useForceUpdateWithCache(): [number, () => void] {
  return useReducer((x: number) => (x === Number.MAX_SAFE_INTEGER ? 0 : x + 1), 0);
}

function useForceUpdate(): () => void {
  const [, forceUpdate] = useForceUpdateWithCache();
  return forceUpdate;
}

function ConnectorF(Component, opt = {}) {
  const options = {
    preLoader: null,
    wairForServices: true,
    services: [],
    test: 0,
    ...opt,
  };

  const composeProps = (props, store) => {
    let composed;
    let helper;
    const result = {};

    if (typeof options !== 'undefined') {
      helper = typeof options === 'function' ? options : options.helper;
    }

    Object.entries(props).forEach(([key, value]) => {
      if (key !== 'store') {
        result[key] = value;
      }
    });

    if (helper) {
      composed = helper.call(null, store);
      Object.entities(composed).forEach(([key, item]) => {
        if (result[key]) {
          console.warn(`Connector. For "${Component.name}" variable name "${key}" exists in the helper and props.`);
        }
        result[key] = item;
      });

      return composed !== undefined ? result : undefined;
    }

    return result;
  };

  const WrapperComponent: React$ComponentType<{ store: * }> = (props) => {
    const forceUpdate = useForceUpdate();
    const upperContextStore = useContext();
    const componentId = useMemo(() => `${Component.name}_${getUid()}`, [Component]);
    const [resolvedStore, setResolvedStore] = useState(null);
    const [servicesLoaded, setServicesLoaded] = useState(true);
    const [resolvedApi, setResolvedApi] = useState({});

    useEffect(() => {
      function resolveStore(store) {
        const resolved = typeof store === 'function' ? store.call(this) : store;

        if (typeof store === 'function' && !resolved) {
          console.warn(`Connector. In component "${Component.name}" store not resolved"`);
        }

        setResolvedStore(resolved);
        return resolved;
      }

      function resolveApi(store) {
        const api = {};

        if (store && store.api) {
          Object.entries(store.api).forEach(([key, apiMethod]) => {
            if (typeof apiMethod === 'function') {
              api[key] = store.callApi
                ? (...arg) => store.binder.callApi(store.getConfig().bindAs, key, componentId, ...arg)
                : apiMethod.bind(store);
            } else {
              console.warn(
                `Connector. For "${Component.name}" api function "${key}" not found in store "${protoName(store)}"`,
              );
            }
          });
          setResolvedApi(api);
        }
      }

      function initComponent() {
        setServicesLoaded(true);
        setResolvedApi(null);

        const store = resolveStore(options.store || props.store || upperContextStore); // eslint-disable-line

        if (store) {
          store.start(componentId);
        }

        resolveApi(store);
      }

      if (options.services.length) {
        Promise.all(options.services.map((service) => service.start(componentId))).then(() => {
          initComponent();

          if (options.wairForServices) {
            forceUpdate();
          }
        });
      }

      if (!options.services.length || !options.wairForServices) {
        initComponent();
      }

      return () => {
        if (resolvedStore) {
          if (typeof resolvedStore.destroy === 'function') {
            resolvedStore.destroy();
          }
          resolvedStore.stop(componentId);
        }

        if (options.services) {
          options.services.forEach((service) => {
            if (!service.config || !service.config.unstoppable) {
              service.stop(componentId);
            }
          });
        }
      };
    }, []);

    if (options.wairForServices && !servicesLoaded) {
      const Preloader = options.preLoader;
      return typeof Preloader === 'function' ? <Preloader /> : Preloader;
    }

    const normalizedProps = composeProps(props, resolvedStore);

    if (normalizedProps !== undefined) {
      if (resolvedApi) {
        normalizedProps.api = resolvedApi;
      }
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Component {...normalizedProps} />;
    }

    const Preloader = options.preLoader;
    return typeof Preloader === 'function' ? <Preloader /> : options.preLoader;
  };

  WrapperComponent.displayName = (
    (Component.displayName && `Connector(${Component.displayName})`)
    || `Connector(${Component.name})`
  );

  return observer(WrapperComponent);

  return observer(class Connector extends React.Component {
    static displayName = (Component.displayName && `Connector(${Component.displayName})`) || `Connector(${Component.name})`;

    UNSAFE_componentWillMount() {
      this.servicesLoaded = false;
      this.componentId = `${Component.name}_${getUid()}`;

      if (options.services.length) {
        Promise.all(options.services.map((service) => service.start(this.componentId))).then(() => {
          this.initComponent();

          if (options.wairForServices) {
            this.forceUpdate();
          }
        });
      }

      if (!options.services.length || !options.wairForServices) {
        this.initComponent();
      }
    }

    componentWillUnmount() {
      if (this.store && this.storeInitializator) {
        if (typeof this.store.destroy === 'function') {
          this.store.destroy();
        }
        this.store.stop(this.componentId);
      }

      if (options.services) {
        options.services.forEach((service) => {
          if (!service.config || !service.config.unstoppable) {
            service.stop(this.componentId);
          }
        });
      }
    }

    initComponent() {
      this.servicesLoaded = true;
      this.apiResolved = null;

      this.storeInitializator = (options.store && typeof options.store === 'function')
        || (this.props.store && typeof this.props.store === 'function');
      this.store = this.resolveStore(options.store || this.props.store); // eslint-disable-line

      if (this.store && this.storeInitializator) {
        this.store.start(this.componentId);
      }
      this.resolveApi(this.store);
    }

    servicesLoaded = false;

    options = {};

    componentId = '';

    apiResolved = null;

    storeInitializator = false;

    store = null;

    resolveStore(store) {
      const storeToResolve = store || this.context.store;
      const resolved = typeof storeToResolve === 'function' ? storeToResolve.call(this) : storeToResolve;

      if (typeof store === 'function' && !resolved) {
        console.warn(`Connector. In component "${Component.name}" store not resolved"`);
      }

      return resolved;
    }

    resolveApi(store) {
      const api = {};
      const { componentId } = this;

      if (store && store.api) {
        each(store.api, (apiMethod, key) => {
          if (typeof apiMethod === 'function') {
            api[key] = store.callApi ? function (...arg) {
              return store.binder.callApi(store.getConfig().bindAs, key, componentId, ...arg);
            } : apiMethod.bind(store);
          } else {
            console.warn(`Connector. For "${Component.name}" api
            function "${key}" not found in store "${protoName(store)}"`);
          }
        });
        this.apiResolved = api;
      }
    }

    composeProps() {
      let composed;
      let helper;
      const result = {};

      if (typeof options !== 'undefined') {
        helper = typeof options === 'function' ? options : options.helper;
      }

      each(props, (value, key) => {
        if (key !== 'store') {
          result[key] = value;
        }
      });

      if (helper) {
        composed = helper.call(this, this.store);
        forIn(composed, (item, key) => {
          if (result[key]) {
            console.warn(`Connector. For "${Component.name}" variable name "${key}" exists in the helper and props.`);
          }
          result[key] = item;
        });

        return composed !== undefined ? result : undefined;
      }

      return result;
    }

    render() {
      if (options.wairForServices && !this.servicesLoaded) {
        const Preloader = options.preLoader;
        return typeof Preloader === 'function' ? <Preloader /> : Preloader;
      }

      const props = this.composeProps();
      let comp = null;

      if (props !== undefined) {
        if (this.apiResolved) {
          props.api = this.apiResolved;
        }
        comp = <Component {...props} />;
      } else {
        const Preloader = options.preLoader;
        return typeof Preloader === 'function' ? <Preloader /> : options.preLoader;
      }

      return comp;
    }
  });
}

export default ConnectorF;
