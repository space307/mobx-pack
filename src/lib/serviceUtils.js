// @flow

import Binder from './Binder.js';
import type { ServiceClassType, ServiceStartConfigType, StartServiceReturnType } from './typing/common.js';
import type { BinderInterface } from './typing/binderInterface.js';

export function createService(Service: ServiceClassType, protoAttrs?: ?Array<*>): * {
  if (protoAttrs && !Array.isArray(protoAttrs)) {
    throw new Error(`Wrong ServiceParams! (${Service.name})`);
  }

  return protoAttrs ? new Service(...protoAttrs) : new Service();
}

export function startService(
  binder: BinderInterface,
  initialState: *,
  serviceStartConfig: ServiceStartConfigType,
): Promise<*> {
  const { binderConfig, proto } = serviceStartConfig;
  const {
    config,
    config: { bindAs },
    onStart,
  } = binderConfig;

  let result;
  const resolver = binder.getPendingStartResolver(bindAs);
  const serviceInBinder = binder.getStore(bindAs);
  const onStartFunctionName = onStart || 'onStart';

  if (serviceInBinder) {
    result = Promise.resolve({ service: serviceInBinder, started: false, serviceStartConfig });
  } else if (resolver) {
    result = resolver;
  } else {
    result = new Promise(
      (resolve: (data: StartServiceReturnType) => void, reject: (error: Error) => void): void => {
        const service = createService(proto, serviceStartConfig.protoAttrs);
        const resolveData = { service, started: true, serviceStartConfig };

        if (!service[onStartFunctionName]) {
          binder.bind(service, config);
          resolve(resolveData);
          return;
        }

        const onStartResult = service[onStartFunctionName](initialState);

        if (onStartResult instanceof Promise) {
          onStartResult
            .then(
              (): void => {
                binder.bind(service, config);
                resolve(resolveData);
              },
            )
            .catch(
              (err: Error): void => {
                reject(err);
              },
            );
        } else if (onStartResult === true) {
          binder.bind(service, config);
          resolve(resolveData);
        } else {
          reject(new Error(`Service ${bindAs} onStart return "false"`));
        }
      },
    ).finally(() => {
      binder.setPendingStartResolver(bindAs, null);
    });

    binder.setPendingStartResolver(bindAs, result);
  }

  return result;
}

export function startServices(
  binder: BinderInterface,
  initialState: *,
  serviceStartConfigList: Array<ServiceStartConfigType>,
): Promise<*> {
  return Promise.all(
    serviceStartConfigList.map(
      (serviceStartConfig: ServiceStartConfigType): Promise<*> =>
        startService(binder, initialState, serviceStartConfig),
    ),
  );
}

export function stopService(binder: BinderInterface, serviceStartConfig: ServiceStartConfigType): void {
  const {
    config: { bindAs },
    onStop,
  } = serviceStartConfig.binderConfig;

  const serviceInBinder = binder.getStore(bindAs);
  const onStopFunctionName = onStop || 'onStop';

  if (serviceInBinder) {
    binder.unbind(bindAs);
    if (typeof serviceInBinder[onStopFunctionName] === 'function') {
      serviceInBinder[onStopFunctionName]();
    }
  }
}

export function stopServices(binder: BinderInterface, serviceStartConfigList: Array<ServiceStartConfigType>): void {
  if (!serviceStartConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }
  serviceStartConfigList.forEach(
    (ServiceProto: ServiceStartConfigType): void => {
      stopService(binder, ServiceProto);
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
        config: { bindAs },
      } = ServiceProto.binderConfig;
      const store = binder.getStore(bindAs);

      if (store) {
        services.push(store);
      }
    },
  );
  return services.length === serviceStartConfigList.length ? services : null;
}
