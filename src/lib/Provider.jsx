// @flow
/**
 * Provider start services (or get it from binder context) and pass it to ServiceContext to a child components
 */

import React from 'react';
import { observer } from 'mobx-react';

import { startServices, stopServices, getStartedServices } from './serviceUtils.js';
import type { GlobalContextType, ServiceStartConfigType, StartServiceReturnType } from './typing/common.js';


type ServiceItemType = Class<*> | Array<*>;

type ProviderOptionsAttributeType = {
  stop?: boolean,
  services?: Array<ServiceItemType> | (props: *)=> Array<ServiceItemType>,
  helper?: (services: ?Array<*>, props: *) => *,
  stub?: React$ComponentType<*>,
};

type ProviderOptionsPropType = {
  ...ProviderOptionsAttributeType,
  services: Array<ServiceItemType>,
};

type ProviderStateTypes = {
  error: ?string,
  services: ?Array<*>,
};

type ProviderType = (
  Component: React$ComponentType<*>,
  options?: ProviderOptionsAttributeType)=>React$ComponentType<*>

function convertToServiceStartConfig(ServiceProtoList: Array<ServiceItemType>): Array<ServiceStartConfigType> {
  return ServiceProtoList.map((ServiceProto: ServiceItemType): ServiceStartConfigType => {
    if (Array.isArray(ServiceProto) && ServiceProto.length < 2) {
      throw Error('ServiceItem passed in Provider is not valid Array');
    }

    const proto = Array.isArray(ServiceProto) && ServiceProto.length ? ServiceProto[0] : ServiceProto;
    const protoAttrs = Array.isArray(ServiceProto) ? ServiceProto[1] : undefined;

    if (typeof proto !== 'function') {
      throw Error('Object passed as ServiceItem to Provider is not a constructor');
    }

    return {
      proto,
      protoAttrs,
      binderConfig: proto.binderConfig,
    };
  });
}

export default function CreateProvider(
  BinderContext: React$Context<GlobalContextType>,
  StoreContext: React$Context<?Array<*>>): ProviderType {
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

          if (!Component || typeof Component !== 'function') {
            this.state.error = 'Provider wait for "React.Component" in attributes';
          }

          if (options) {
            const services = typeof options.services === 'function' ? options.services(props) : options.services;
            const { stop, helper, stub } = options;
            this.options = { ...defaultOptions, ...{ stop, helper, stub }, ...{ services } };
          } else {
            this.options = { ...defaultOptions };
          }

          if (this.options.services) {
            const config = convertToServiceStartConfig(this.options.services);

            if (context && context.binder) {
              this.state.services = getStartedServices(context.binder, config);
            }
          }
        }

        componentDidMount(): void {
          if ((!this.state.services || !this.state.services.length) &&
            this.context && this.context.binder && this.context.initialState) {
            this.startServices();
          }
        }

        componentWillUnmount() {
          if (this.options.stop && this.serviceToStop && this.serviceToStop.length) {
            const { binder } = this.context;
            stopServices(binder, this.serviceToStop);
          }
        }

        startServices() {
          const { services: ServiceProtoList } = this.options;
          const { binder, initialState } = this.context;

          if (ServiceProtoList && ServiceProtoList.length) {
            const serviceStartConfigList = convertToServiceStartConfig(ServiceProtoList);

            startServices(binder, initialState, serviceStartConfigList).then((services: *) => {
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

              this.setState({ services: result.services });
            });
          } else {
            this.setState({ services: [] });
          }
        }

        composeProps(result: ?Array<*>, props: PropType) {
          if (result && typeof this.options.helper) {
            const attributes = Array.isArray(result) ? result.slice() : [];
            attributes.push(props);
            return this.options.helper ? this.options.helper(...attributes) : props;
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
              <StoreContext.Provider value={this.state.services}>
                <Component {...props} />
              </StoreContext.Provider>
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

