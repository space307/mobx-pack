// @flow
/**
 * Provider start services (or get it from binder context) and pass it to ServiceContext to a child components
 */

import React from 'react';
import { isValidElementType } from 'react-is';
import { observer } from 'mobx-react';

import { startServices, stopServices, getStartedServices } from './serviceUtils.js';
import { isClass } from './helper/util.js';
import type { GlobalContextType, ServiceStartConfigType, StartServiceReturnType } from './typing/common.js';

export type ServicesHashType = {[key:string]:*};

type ServiceItemType = Class<*> | Array<*>;

type ProviderOptionsAttributeType = {
  stop?: boolean,
  services?: Array<ServiceItemType> | (props: *)=> Array<ServiceItemType>,
  helper?: (services: ?ServicesHashType, props: *) => *,
  stub?: React$ComponentType<*>,
};

type ProviderOptionsPropType = {
  ...ProviderOptionsAttributeType,
  services: Array<ServiceItemType>,
};

type ProviderStateTypes = {
  error: ?string,
  services: ?ServicesHashType,
};

export type ProviderType = (
  Component: React$ComponentType<*>,
  options?: ProviderOptionsAttributeType)=>React$ComponentType<*>;

/**
 * Convert incoming param with service list to start service format
 */
function convertToServiceStartConfig(ServiceProtoList: Array<ServiceItemType>): Array<ServiceStartConfigType> {
  return ServiceProtoList.map((ServiceProto: ServiceItemType): ServiceStartConfigType => {
    if (Array.isArray(ServiceProto) && ServiceProto.length < 2) {
      throw Error('ServiceItem passed in Provider is not valid Array');
    }

    const proto = Array.isArray(ServiceProto) && ServiceProto.length ? ServiceProto[0] : ServiceProto;
    const protoAttrs = Array.isArray(ServiceProto) && Array.isArray(ServiceProto[1]) ? ServiceProto[1] : undefined;
    const factory = Array.isArray(ServiceProto) &&
    typeof ServiceProto[1] === 'function' &&
    !isClass(ServiceProto[1]) ? ServiceProto[1] : undefined;


    if (typeof proto !== 'function') {
      throw Error('Object passed as ServiceItem to Provider is not a constructor');
    }

    return {
      factory,
      proto,
      protoAttrs,
      binderConfig: proto.binderConfig,
    };
  });
}

/**
 * Convert service Array to object for service context provider
 */
function convertToServiceHash(list: ?Array<*>): ?ServicesHashType {
  return list && list.length ?
    list.reduce((acc, item) => {
      if (!item.constructor.binderConfig || !item.constructor.binderConfig.bindAs) {
        throw new Error('Cannot convert service hash because binderConfig or bindAs props not exits');
      }

      const name = item.constructor.binderConfig.bindAs;

      acc[name.charAt(0).toLowerCase() + name.slice(1)] = item;
      return acc;
    }, {}) : null;
}

/**
 * return name of React.Component
 */
function getComponentName(Component: React$ComponentType<*>): string {
  return Component && typeof Component.name === 'string' ? Component.name : 'unknown';
}

export default function createProvider(
  BinderContext: React$Context<GlobalContextType>,
  ServiceContext: React$Context<?ServicesHashType>): ProviderType {
  return function Provider(
    Component: React$ComponentType<*>,
    options?: ProviderOptionsAttributeType,
  ): React$ComponentType<*> {
    const defaultOptions = {
      stop: false,
      services: [],
    };

    return observer(
      class ProviderComponent<PropType> extends React.Component<PropType, ProviderStateTypes> {
        state: ProviderStateTypes = {
          error: null,
          services: null,
        };

        static contextType = BinderContext;

        options: $Shape<ProviderOptionsPropType>;

        serviceToStop: Array<ServiceStartConfigType> = [];

        constructor(props: PropType, context) {
          super();

          if (!context) {
            this.state.error = `Binder context not found in Provider
            (component: ${getComponentName(Component)})`;
          } else if (!isValidElementType(Component)) {
            this.state.error = 'Provider wait for "React.Component" in attributes';
          } else if (options && options.helper && typeof options.helper !== 'function') {
            this.state.error = `Helper put to Provider
            (component: ${getComponentName(Component)}) should be a function`;
          }

          if (options) {
            const services = typeof options.services === 'function' ? options.services(props) : options.services;
            const { stop, helper, stub } = options;
            this.options = { ...defaultOptions, ...{ stop, helper, stub }, ...{ services } };
          } else {
            this.options = { ...defaultOptions };
          }

          if (this.options.services) {
            let config;

            try {
              config = convertToServiceStartConfig(this.options.services);
            } catch (err) {
              this.state.error = `${err.message} (component: ${getComponentName(Component)})`;
            }

            if (context && config) {
              const serviceList = getStartedServices(context, config);
              this.state.services = convertToServiceHash(serviceList);
            }
          }
        }

        /**
         * Ser service list to state && for service context provider
         */
        setServices(list) {
          this.setState({ services: convertToServiceHash(list) });
        }

        componentDidMount(): void {
          if ((!this.state.services || !this.state.services.length) &&
            this.context) {
            this.startServices();
          }
        }

        componentWillUnmount() {
          if (this.options.stop && this.serviceToStop && this.serviceToStop.length) {
            stopServices(this.context, this.serviceToStop);
          }
        }

        /**
         * Start service procedure
         */
        startServices() {
          const { services: ServiceProtoList } = this.options;
          const binder = this.context;

          if (ServiceProtoList && ServiceProtoList.length) {
            let serviceStartConfigList;
            try {
              serviceStartConfigList = convertToServiceStartConfig(ServiceProtoList);
            } catch (err) {
              this.setState({ error: `${err.message} (component: ${getComponentName(Component)})` });
            }

            if (serviceStartConfigList) {
              startServices(binder, serviceStartConfigList).then((services: *) => {
                type ResultType = {
                  toStop: Array<ServiceStartConfigType>,
                  services: Array<*>,
                };
                const result = {
                  toStop: [],
                  services: [],
                };

                services.reduce(
                  (acc: ResultType, { service, started, serviceStartConfig }: StartServiceReturnType): ResultType => {
                    if (started) {
                      acc.toStop.push(serviceStartConfig);
                    }
                    acc.services.push(service);
                    return acc;
                  },
                  result,
                );

                this.serviceToStop = result.toStop;

                this.setServices(result.services);
              });
            }
          } else {
            this.setServices([]);
          }
        }

        /**
         * Merge props for wrapped component and call helper
         */
        composeProps(services: ?ServicesHashType, props: PropType) {
          if (services && typeof this.options.helper) {
            return this.options.helper ? this.options.helper(services, props) : props;
          }
          return props;
        }

        render() {
          if (this.state.error) {
            throw new Error(this.state.error);
          }

          const props = this.composeProps(this.state.services, this.props);
          const hasService = this.options.services && this.options.services.length;
          const serviceOk = !hasService || this.state.services;
          const helperOk = !this.options.helper || !!props;
          const Stub = this.options.stub;

          if (serviceOk && helperOk) {
            return hasService ? (
              <ServiceContext.Provider value={this.state.services}>
                <Component {...props} />
              </ServiceContext.Provider>
            ) : (
              <Component {...props} />
            );
          }
          return typeof Stub === 'function' ? <Stub /> : null;
        }
      },
    );
  };
}

