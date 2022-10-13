import type { BindableEntity, ServiceConnectorOptions } from './typing/common.js';

function startOk(service: BindableEntity, options: ServiceConnectorOptions) {
  if (!options.binder.isBind(options.config.bindAs)) {
    options.binder.bind(service, options.config);
  }

  service.__serviceOptions.started = true;
}

function stopOk(service: BindableEntity, options: ServiceConnectorOptions) {
  options.binder.unbind(options.config.bindAs);
  service.__serviceOptions.started = false;
}

export function ServiceConnector(service: BindableEntity, options: ServiceConnectorOptions) {
  if (!service.__serviceOptions) {
    service.__serviceOptions = {
      started: false,
    };
  }

  if (typeof service.start !== 'function' && !service.__serviceOptions.started) {
    service.start = () =>
      new Promise<void>((resolve, reject) => {
        const rawOnStart = options.onStart || service.onStart;
        let onStart;
        // @ts-expect-error service[rawOnStart] is unresovable
        if (typeof rawOnStart === 'string' && typeof service[rawOnStart] === 'function') {
          // @ts-expect-error service[rawOnStart] is unresovable
          onStart = service[rawOnStart];
        } else {
          onStart = options.onStart || service.onStart;
        }

        if (typeof onStart === 'function' && !service.__serviceOptions.started) {
          // eslint-disable-next-line
          // @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          const onStartResult = onStart.call(service, options.initialState);

          if (onStartResult instanceof Promise) {
            onStartResult
              .then(() => {
                startOk(service, options);
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          } else if (onStartResult !== false) {
            startOk(service, options);
            resolve();
          } else {
            reject(`Service ${options.config.bindAs} onStart return "false"`); // eslint-disable-line
            // prefer-promise-reject-errors, max-len
          }
        } else {
          startOk(service, options);
          resolve();
        }
      });

    service.stop = function () {
      let onStop = options.onStop || service.onStop;
      // @ts-expect-error unfixable
      if (typeof onStop === 'string' && typeof service[onStop] === 'function') {
        // @ts-expect-error unfixable
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
