// @flow

import React from 'react';
import { observer } from 'mobx-react';

import { startServices, stopServices, type StartServiceReturnType } from './serviceUtils.js';
import type { ServiceConfigType, GlobalContextType } from './typing/common.js';


type ConnectorOptionsAttributeType<InitialStateType> = {
  stop: boolean,
  services: Array<ServiceConfigType<InitialStateType>> | (props: *)=> Array<ServiceConfigType<InitialStateType>>,
  helper: (services: ?Array<*>, props: *) => *,
};

type ConnectorOptionsPropType<InitialStateType> = {
  ...ConnectorOptionsAttributeType<InitialStateType>,
  services: Array<ServiceConfigType<InitialStateType>>,
};

type ConnectorStateTypes = {
  error: ?string,
  result: ?Array<*>,
};

type ProviderType = (
  Component: React$ComponentType<*>,
  options: ConnectorOptionsAttributeType<*>)=>React$ComponentType<*>

export default function CreateProvider(
  BinderContext: React$Context<GlobalContextType>,
  StoreContext: React$Context<?Array<*>>): ProviderType {
  return function Provider(
    Component: React$ComponentType<*>,
    options: ConnectorOptionsAttributeType<*>,
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

        options: $Shape<ConnectorOptionsPropType<*>>;

        serviceToStop: Array<ServiceConfigType<*>> = [];

        constructor(props: PropType) {
          super();

          const services = typeof options.services === 'function' ? options.services(props) : options.services;
          const { stop, helper } = options;

          this.options = { ...defaultOptions, ...{ stop, helper }, ...{ services } };
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
          const { services: ServiceConfigList } = this.options;
          const { binder, initialState } = this.context;

          if (!binder || !initialState) {
            this.setState({ error: 'binder && initialState not received in Container' });
          }

          if (ServiceConfigList && ServiceConfigList.length) {
            startServices(binder, initialState, ServiceConfigList).then((services: *) => {
              type ResultType = {
                toStop: Array<ServiceConfigType<*>>,
                services: Array<*>,
              };
              const result = {
                toStop: [],
                services: [],
              };

              services.reduce(
                (acc: ResultType, { service, started, serviceConfig }: StartServiceReturnType): ResultType => {
                  if (started) {
                    acc.toStop.push(serviceConfig);
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

          if (serviceOk && helperOk) {
            return hasService ? (
              <StoreContext.Provider value={this.state.result}>
                <Component {...props} />
              </StoreContext.Provider>
            ) : (
              <Component {...props} />
            );
          }
          return null;
        }
      },
    );
  };
}

