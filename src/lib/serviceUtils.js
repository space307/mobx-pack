// @flow

import Binder from './Binder.js';
import type { ServiceClassType, ServiceStartConfigType, StartServiceReturnType } from './typing/common.js';


function createService(Service: ServiceClassType, protoAttrs?: ?Array<*>): * {
  if (protoAttrs && !Array.isArray(protoAttrs)) {
    throw new Error(`Wrong ServiceParams! (${Service.name})`);
  }

  return protoAttrs ? new Service(...protoAttrs) : new Service();
}

export function startService(serviceStartConfig: ServiceStartConfigType, binder: Binder, initialState: *): Promise<*> {
  const { binderConfig, proto } = serviceStartConfig;
  const {
    config,
    config: { bindAs },
    onStart,
  } = binderConfig;


  const serviceInBinder = binder.getStore(bindAs);
  const onStartFunctionName = onStart || 'onStart';

  return serviceInBinder
    ? Promise.resolve({ service: serviceInBinder, started: false, serviceStartConfig })
    : new Promise(
      (resolve: (data: StartServiceReturnType) => void, reject: (error: Error) => void): void => {
        const service = createService(proto, serviceStartConfig.protoAttrs);
        const result = { service, started: true, serviceStartConfig };

        if (!service[onStartFunctionName]) {
          binder.bind(service, config);
          resolve(result);
          return;
        }

        const onStartResult = service[onStartFunctionName](initialState);

        if (onStartResult instanceof Promise) {
          onStartResult
            .then(
              (): void => {
                binder.bind(service, config);
                resolve(result);
              },
            )
            .catch(
              (err: Error): void => {
                reject(err);
              },
            );
        } else if (onStartResult === true) {
          binder.bind(service, config);
          resolve(result);
        } else {
          reject(new Error(`Service ${bindAs} onStart return "false"`));
        }
      },
    );
}

export function startServices(
  binder: Binder,
  initialState: *,
  serviceStartConfigList: Array<ServiceStartConfigType>,
): Promise<*> {
  return Promise.all(
    serviceStartConfigList.map(
      (serviceStartConfig: ServiceStartConfigType): Promise<*> =>
        startService(serviceStartConfig, binder, initialState),
    ),
  );
}

export function stopService(binder: Binder, serviceStartConfig: ServiceStartConfigType): void {
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

export function stopServices(binder: Binder, serviceStartConfigList: Array<ServiceStartConfigType>): void {
  if (!serviceStartConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }
  serviceStartConfigList.forEach(
    (ServiceProto: ServiceStartConfigType): void => {
      stopService(binder, ServiceProto);
    },
  );
}
