"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ServiceConnector;

function startOk(service, options) {
  if (!options.binder.isBind(options.config.bindAs)) {
    options.binder.bind(service, options.config);
  }

  service.__serviceOptions.started = true;
}

function stopOk(service, options) {
  options.binder.unbind(options.config.bindAs);
  service.__serviceOptions.started = false;
}

function ServiceConnector(service, options) {
  if (!service.__serviceOptions) {
    service.__serviceOptions = {
      started: false
    };
  }

  if (typeof service.start !== 'function' && !service.__serviceOptions.started) {
    service.start = function () {
      return new Promise(function (resolve, reject) {
        var onStart = options.onStart || service.onStart;

        if (typeof onStart === 'string' && typeof service[onStart] === 'function') {
          onStart = service[onStart];
        }

        if (typeof onStart === 'function') {
          var onStartResult = onStart.call(service, options.initialState);

          if (onStartResult instanceof Promise) {
            onStartResult.then(function () {
              startOk(service, options);
              resolve();
            }).catch(function (err) {
              reject(err);
            });
          } else if (onStartResult !== false) {
            startOk(service, options);
            resolve();
          } else {
            reject("Service ".concat(options.config.bindAs, " onStart return \"false\"")); // eslint-disable-line prefer-promise-reject-errors, max-len
          }
        } else {
          startOk(service, options);
          resolve();
        }
      });
    };

    service.stop = function () {
      var onStop = options.onStop || service.onStop;

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
//# sourceMappingURL=ServiceConnector.js.map