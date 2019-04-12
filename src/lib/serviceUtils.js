// @flow

import type { ServiceStartConfigType } from './typing/common.js';
import type { BinderInterface } from './typing/binderInterface.js';


export function startServices(
  binder: BinderInterface,
  serviceStartConfigList: Array<ServiceStartConfigType>,
): Promise<*> {
  return Promise.all(
    serviceStartConfigList.map(
      (serviceStartConfig: ServiceStartConfigType): Promise<*> =>
        binder.start(serviceStartConfig),
    ),
  );
}


export function stopServices(binder: BinderInterface, serviceStartConfigList: Array<ServiceStartConfigType>): void {
  if (!serviceStartConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }
  serviceStartConfigList.forEach(
    (ServiceProto: ServiceStartConfigType): void => {
      binder.stop(ServiceProto);
    },
  );
}

export function getStartedServices(
  binder: BinderInterface,
  serviceStartConfigList: Array<ServiceStartConfigType>): ?Array<*> {
  const services = [];
  serviceStartConfigList.forEach(
    (ServiceProto: ServiceStartConfigType): void => {
      const {
        bindAs,
      } = ServiceProto.binderConfig;

      const service = binder.getService(bindAs);

      if (service) {
        services.push(service);
      }
    },
  );
  return services.length === serviceStartConfigList.length ? services : null;
}
