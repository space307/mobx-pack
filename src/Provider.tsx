// @flow
/**
 * Provider start services (or get it from binder context) and pass it to ServiceContext to a child components
 */

import * as React from 'react';
import { useContext } from 'react';
import { isValidElementType } from 'react-is';
import { observer } from 'mobx-react';
import type { Binder } from './Binder';

import { startServices, stopServices, getStartedServices } from './serviceUtils.js';
import { isClass } from './helper/util.js';
import type {
  BindableEntity,
  BindableEntityConstructor,
  BindableEntityStartConfig,
  Constructor,
  StartBindableEntityResult,
} from './typing/common.js';

export type ServicesHashType = Record<string, unknown>;

export type ServiceItemType =
  | Constructor
  | [
      service: BindableEntityStartConfig['proto'],
      factory: BindableEntityStartConfig['factory'] | unknown,
      ...args: unknown[],
    ];

type ProviderOptionsAttributeType<Props extends object, ModifiedProps extends object> = {
  stop?: boolean;
  services: ServiceItemType[] | ((props: unknown) => ServiceItemType[]);
  helper?: (services: any, props: Props) => ModifiedProps;
  stub?: React.ComponentType;
};

type ProviderOptionsPropType = ProviderOptionsAttributeType & {
  services: ServiceItemType[];
};

type ProviderStateTypes = {
  error: string | null;
  services: ServicesHashType | null;
};

/**
 * Convert incoming param with service list to start service format
 */
function convertToServiceStartConfig(
  ServiceProtoList: ServiceItemType[],
): BindableEntityStartConfig[] {
  return ServiceProtoList.map(ServiceProto => {
    if (Array.isArray(ServiceProto) && ServiceProto.length < 2) {
      throw Error('ServiceItem passed in Provider is not valid Array');
    }

    const proto =
      Array.isArray(ServiceProto) && ServiceProto.length
        ? ServiceProto[0]
        : (ServiceProto as BindableEntityConstructor);
    const protoAttrs =
      Array.isArray(ServiceProto) && Array.isArray(ServiceProto[1]) ? ServiceProto[1] : [];
    const factory =
      Array.isArray(ServiceProto) &&
      typeof ServiceProto[1] === 'function' &&
      !isClass(ServiceProto[1])
        ? (ServiceProto[1] as BindableEntityStartConfig['factory'])
        : null;

    if (typeof proto !== 'function') {
      throw Error('Object passed as ServiceItem to Provider is not a constructor');
    }

    const result: BindableEntityStartConfig = {
      factory,
      proto,
      protoAttrs,
      binderConfig: proto.binderConfig,
    };

    return result;
  });
}

/**
 * Convert service Array to object for service context provider
 */
function convertToServiceHash(list: BindableEntity[] | null): ServicesHashType | null {
  if (!list || !list.length) {
    return null;
  }

  return list.reduce<Record<string, BindableEntity>>((acc, item) => {
    const ctr = item.constructor;
    if (!ctr.binderConfig || !ctr.binderConfig.bindAs) {
      throw new Error('Cannot convert service hash because binderConfig or bindAs props not exits');
    }

    const name = ctr.binderConfig.bindAs;

    acc[name.charAt(0).toLowerCase() + name.slice(1)] = item;
    return acc;
  }, {});
}

/**
 * return name of React.Component
 */
function getComponentName(Component: React.ComponentType): string {
  return Component && typeof Component.name === 'string' ? Component.name : 'unknown';
}

export function createProvider(
  BinderContext: React.Context<Binder>,
  ServiceContext: React.Context<ServicesHashType | null>,
) {
  return function Provider<Props extends object, CombinedProps extends object = object>(
    Component: React.ComponentType<Props>,
    options?: ProviderOptionsAttributeType<Props, CombinedProps>,
  ): React.ComponentType<Omit<Props, keyof CombinedProps>> {
    const defaultOptions = {
      stop: false,
      services: [],
    };

    const ProviderC = observer(
      class ProviderComponent<PropType extends object> extends React.Component<
        PropType & { binder: Binder },
        ProviderStateTypes
      > {
        state: ProviderStateTypes = {
          error: null,
          services: null,
        };

        options: ProviderOptionsPropType;

        serviceToStop: BindableEntityStartConfig[] = [];

        constructor(props: PropType & { binder: Binder }) {
          super(props);

          if (!props.binder) {
            this.state.error = `Binder context not found in Provider
            (component: ${getComponentName(Component)})`;
          } else if (!isValidElementType(Component)) {
            this.state.error = 'Provider wait for "React.Component" in attributes';
          } else if (options && options.helper && typeof options.helper !== 'function') {
            this.state.error = `Helper put to Provider
            (component: ${getComponentName(Component)}) should be a function`;
          }

          if (options) {
            const services =
              typeof options.services === 'function' ? options.services(props) : options.services;
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
              if (err instanceof Error) {
                this.state.error = `${err.message} (component: ${getComponentName(Component)})`;
              } else {
                this.state.error = `${
                  err ? err.toString() : 'unknown error'
                } (component: ${getComponentName(Component)})`;
              }
            }

            if (props.binder && config) {
              const serviceList = getStartedServices(props.binder, config);
              this.state.services = convertToServiceHash(serviceList);
            }
          }
        }

        /**
         * Ser service list to state && for service context provider
         */
        setServices(list: BindableEntity[] | null) {
          this.setState({ services: convertToServiceHash(list) });
        }

        componentDidMount(): void {
          if ((!this.state.services || !this.state.services.length) && this.props.binder) {
            this.startServices();
          }
        }

        componentWillUnmount() {
          if (this.options.stop && this.serviceToStop && this.serviceToStop.length) {
            stopServices(this.props.binder, this.serviceToStop);
          }
        }

        /**
         * Start service procedure
         */
        startServices() {
          const { services: ServiceProtoList } = this.options;
          const { binder } = this.props;

          if (ServiceProtoList && ServiceProtoList.length) {
            let serviceStartConfigList;
            try {
              serviceStartConfigList = convertToServiceStartConfig(ServiceProtoList);
            } catch (err) {
              if (err instanceof Error) {
                this.setState({
                  error: `${err.message} (component: ${getComponentName(Component)})`,
                });
              } else {
                this.setState({
                  error: `${err ? err.toString() : 'unknown error'} (component: ${getComponentName(
                    Component,
                  )})`,
                });
              }
            }

            if (serviceStartConfigList) {
              void startServices(binder, serviceStartConfigList).then(services => {
                type ResultType = {
                  toStop: BindableEntityStartConfig[];
                  services: unknown[];
                };
                const result = {
                  toStop: [],
                  services: [],
                };

                services.reduce(
                  (
                    acc: ResultType,
                    { service, started, serviceStartConfig }: StartBindableEntityResult,
                  ): ResultType => {
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
        composeProps(services: ServicesHashType | null, props: PropType) {
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

    return function BinderProvider(props) {
      const binder = useContext(BinderContext);
      return <ProviderC binder={binder} {...props} />;
    };
  };
}
