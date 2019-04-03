// @flow
import type { ServiceConnectorOptionsTypes } from 'src/lib/typing/serviceConnectorTypes.js';


function startOk(service: *, options: ServiceConnectorOptionsTypes) {
  if (!options.binder.isBind(options.config.bindAs)) {
    options.binder.bind(service, options.config);
  }

  service.__serviceOptions.started = true;
}

function stopOk(service: *, options: ServiceConnectorOptionsTypes) {
  options.binder.unbind(options.config.bindAs);
  service.__serviceOptions.started = false;
}


export default function ServiceConnector(service: *, options: ServiceConnectorOptionsTypes): * {
  if (!service.__serviceOptions) {
    service.__serviceOptions = {
      started: false,
    };
  }

  if (typeof service.start !== 'function' && !service.__serviceOptions.started) {
    service.start = function (): Promise<*> {
      return new Promise((resolve, reject) => {
        let onStart = options.onStart || service.onStart;
        if (typeof onStart === 'string' && typeof service[onStart] === 'function') {
          onStart = service[onStart];
        }

        if (typeof onStart === 'function') {
          const onStartResult = onStart.call(service, options.initialState);

          if (onStartResult instanceof Promise) {
            onStartResult.then(() => {
              startOk(service, options);
              resolve();
            }).catch((err) => {
              reject(err);
            });
          } else if (onStartResult !== false) {
            startOk(service, options);
            resolve();
          } else {
            reject(`Service ${options.config.bindAs} onStart return "false"`); // eslint-disable-line prefer-promise-reject-errors, max-len
          }
        } else {
          startOk(service, options);
          resolve();
        }
      });
    };

    service.stop = function () {
      let onStop = options.onStop || service.onStop;
      if (typeof onStop === 'string' && typeof service[onStop] === 'function') {
        onStop = service[onStop];
      }

      if (typeof onStop === 'function') {
        onStop.call(service);
      }

      stopOk(service, options);
    };
  }

  return service;
}
