import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { each, forIn } from 'lodash';
import { getUid, protoName } from './util.js';


function ConnectorF(Component, opt = {}) {
  const options = Object.assign({
    wairForServices: true,
    services: [],
    test: 0,
  }, opt);


  return observer(class Connector extends React.Component {
    static displayName = (Component.displayName && `${Component.displayName}Connector`) || `${Component.name}Connector`;

    static childContextTypes = {
      store: PropTypes.object,
    };

    static contextTypes = {
      store: PropTypes.object,
    };

    getChildContext() {
      return {
        store: this.store,
      };
    }

    componentWillMount() {
      this.servicesLoaded = false;
      this.options = options;
      this.componentId = `${Component.name}_${getUid()}`;

      if (this.options.services.length) {
        Promise.all(
          this.options.services.map(service => service.start(this.componentId)),
        ).then(() => {
          this.initComponent();

          if (this.options.wairForServices) {
            this.forceUpdate();
          }
        });
      }

      if (!this.options.services.length || !this.options.wairForServices) {
        this.initComponent();
      }
    }

    componentWillUnmount() {
      if (this.store && this.store.destroy && this.storeInitializator) {
        this.store.destroy();
      }

      if (this.options.services) {
        this.options.services.forEach((service) => {
          if (!service.config.unstoppable) {
            service.stop(this.componentId);
          }
        });
      }
    }

    initComponent() {
      this.servicesLoaded = true;
      this.apiResolved = null;
      this.storeInitializator = this.options.store && typeof this.options.store === 'function';
      this.store = this.resolveStore(this.options.store || this.props.store); // eslint-disable-line

      if (this.store && this.store.start) {
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
      const componentId = this.componentId;

      if (store && store.api) {
        each(store.api, (value, key) => {
          if (typeof value === 'function') {
            api[key] = function (...arg) {
              return store.binder.callApi(store.getConfig().bindAs, key, componentId, ...arg);
            };
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
      const o = this.options;

      if (typeof o !== 'undefined') {
        helper = typeof o === 'function' ? o : o.helper;
      }

      each(this.props, (value, key) => {
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
      if (this.options.wairForServices && !this.servicesLoaded) {
        return null;
      }

      const props = this.composeProps();
      let comp = null;

      if (props !== undefined) {
        if (this.apiResolved) {
          props.api = this.apiResolved;
        }
        comp = <Component{...props} />;
      }

      return comp;
    }
  });
}

export default ConnectorF;

