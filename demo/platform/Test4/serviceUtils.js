// @flow

import { Binder } from 'sources.js';
import type { ServiceConfigType } from './types.js';

export type StartServiceReturnType = {
  service: *,
  started: boolean,
  serviceConfig: ServiceConfigType<*>,
};

function createService(Service: *, protoAttrs?: ?Array<*>): * {
  if (protoAttrs && !Array.isArray(protoAttrs)) {
    throw new Error(`Wrong ServiceParams! (${Service.name})`);
  }

  return protoAttrs ? new Service(...protoAttrs) : new Service();
}

export function startService(serviceConfig: ServiceConfigType<*>, binder: Binder, initialState: *): Promise<*> {
  const {
    config,
    config: { bindAs },
    onStart,
    proto: Service,
    protoAttrs,
  } = serviceConfig;
  const serviceInBinder = binder.getStore(bindAs).store;
  const onStartFunctionName = onStart || 'onStart';

  return serviceInBinder
    ? Promise.resolve({ service: serviceInBinder, started: false, serviceConfig })
    : new Promise(
        (resolve: (data: StartServiceReturnType) => void, reject: (error: Error) => void): void => {
          const service = createService(Service, protoAttrs);

          if (!service[onStartFunctionName]) {
            reject(new Error(`OnStart method not found! (${Service.name})`));
          }

          const onStartResult = service[onStartFunctionName](initialState);

          if (onStartResult instanceof Promise) {
            onStartResult
              .then(
                (): void => {
                  binder.bind(service, config);
                  resolve({ service, started: true, serviceConfig });
                },
              )
              .catch(
                (err: Error): void => {
                  reject(err);
                },
              );
          } else if (onStartResult === true) {
            binder.bind(service, config);
            resolve({ service, started: true, serviceConfig });
          } else {
            reject(new Error(`Service ${bindAs} onStart return "false"`));
          }
        },
      );
}

export function startServices<T>(
  binder: Binder,
  initialState: T,
  serviceConfigList: Array<ServiceConfigType<*>>,
): Promise<*> {
  return Promise.all(
    serviceConfigList.map(
      (serviceConfig: ServiceConfigType<*>): Promise<*> => startService(serviceConfig, binder, initialState),
    ),
  );
}

export function stopService(serviceConfig: ServiceConfigType<*>, binder: Binder): void {
  const {
    config: { bindAs },
    onStop,
  } = serviceConfig;

  const serviceInBinder = binder.getStore(bindAs).store;
  const onStopFunctionName = onStop || 'onStop';

  if (serviceInBinder) {
    binder.unbind(bindAs);
    if (typeof serviceInBinder[onStopFunctionName] === 'function') {
      serviceInBinder[onStopFunctionName]();
    }
  }
}

export function stopServices(binder: Binder, serviceConfigList: Array<ServiceConfigType<*>>): void {
  if (!serviceConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }

  serviceConfigList.forEach(
    (serviceConfig: ServiceConfigType<*>): void => {
      stopService(serviceConfig, binder);
    },
  );
}
