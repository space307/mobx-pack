// @flow

import React from 'react';
import { observer } from 'mobx-react';

import { startServices, stopServices } from './serviceUtils.js';
import type { GlobalContextType, ServiceStartConfigType, StartServiceReturnType } from './typing/common.js';


type ServiceItemType = Class<*> | Array<*>;

type ConnectorOptionsAttributeType = {
  stop?: boolean,
  services?: Array<ServiceItemType> | (props: *)=> Array<ServiceItemType>,
  helper?: (services: ?Array<*>, props: *) => *,
  stub?: React$ComponentType<*>,
};

type ConnectorOptionsPropType = {
  ...ConnectorOptionsAttributeType,
  services: Array<ServiceItemType>,
};

type ConnectorStateTypes = {
  error: ?string,
  result: ?Array<*>,
};

type ProviderType = (
  Component: React$ComponentType<*>,
  options?: ConnectorOptionsAttributeType)=>React$ComponentType<*>

function convertToServiceStartConfig(ServiceProtoList: Array<ServiceItemType>): Array<ServiceStartConfigType> {
  return ServiceProtoList.map((ServiceProto: ServiceItemType): ServiceStartConfigType => {
    const proto = Array.isArray(ServiceProto) ? ServiceProto[0] : ServiceProto;
    const protoAttrs = Array.isArray(ServiceProto) ? ServiceProto[1] : undefined;

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
    options?: ConnectorOptionsAttributeType,
  ): React$ComponentType<*> {
    const defaultOptions = {
      stop: false,
      services: [],
    };

    return observer(
      class ConnectorComponent<PropType> extends React.Component<PropType, ConnectorStateTypes> {
        state = {
          error: null,
          result: null,
        };

        static contextType = BinderContext;

        options: $Shape<ConnectorOptionsPropType>;

        serviceToStop: Array<ServiceStartConfigType> = [];

        constructor(props: PropType) {
          super();


          if (options) {
            const services = typeof options.services === 'function' ? options.services(props) : options.services;
            const { stop, helper } = options;
            this.options = { ...defaultOptions, ...{ stop, helper }, ...{ services } };
          } else {
            this.options = { ...defaultOptions };
          }
        }

        componentDidMount(): void {
          this.startServices();
        }
        componentWillUnmount() {
          if (this.options.stop && this.serviceToStop && this.serviceToStop.length) {
            const { binder } = this.context;
            stopServices(this.serviceToStop, binder);
          }
        }

        startServices() {
          const { services: ServiceProtoList } = this.options;
          const { binder, initialState } = this.context;

          if (!binder || !initialState) {
            this.setState({ error: 'binder && initialState not received in Container' });
          }

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

              this.setState({ result: result.services });
            });
          } else {
            this.setState({ result: [] });
          }
        }

        composeProps(result: ?Array<*>, props: PropType) {
          return result && this.options.helper ? this.options.helper(result, props) : props;
        }

        render() {
          const props = this.composeProps(this.state.result, this.props);
          const hasService = this.options.services && this.options.services.length;
          const serviceOk = !hasService || this.state.result;
          const helperOk = !this.options.helper || !!props;
          const Stub = this.options.stub;

          if (serviceOk && helperOk) {
            return hasService ? (
              <StoreContext.Provider value={this.state.result}>
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

