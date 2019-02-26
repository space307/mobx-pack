"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startService = startService;
exports.startServices = startServices;
exports.stopService = stopService;
exports.stopServices = stopServices;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _Binder = _interopRequireDefault(require("./Binder.js"));

function createService(Service, protoAttrs) {
  if (protoAttrs && !Array.isArray(protoAttrs)) {
    throw new Error("Wrong ServiceParams! (".concat(Service.name, ")"));
  }

  return protoAttrs ? (0, _construct2.default)(Service, (0, _toConsumableArray2.default)(protoAttrs)) : new Service();
}

function startService(serviceConfig, binder, initialState) {
  var config = serviceConfig.config,
      bindAs = serviceConfig.config.bindAs,
      onStart = serviceConfig.onStart,
      Service = serviceConfig.proto,
      protoAttrs = serviceConfig.protoAttrs;
  var serviceInBinder = binder.getStore(bindAs).store;
  var onStartFunctionName = onStart || 'onStart';
  return serviceInBinder ? Promise.resolve({
    service: serviceInBinder,
    started: false,
    serviceConfig: serviceConfig
  }) : new Promise(function (resolve, reject) {
    var service = createService(Service, protoAttrs);

    if (!service[onStartFunctionName]) {
      reject(new Error("OnStart method not found! (".concat(Service.name, ")")));
    }

    var onStartResult = service[onStartFunctionName](initialState);

    if (onStartResult instanceof Promise) {
      onStartResult.then(function () {
        binder.bind(service, config);
        resolve({
          service: service,
          started: true,
          serviceConfig: serviceConfig
        });
      }).catch(function (err) {
        reject(err);
      });
    } else if (onStartResult === true) {
      binder.bind(service, config);
      resolve({
        service: service,
        started: true,
        serviceConfig: serviceConfig
      });
    } else {
      reject(new Error("Service ".concat(bindAs, " onStart return \"false\"")));
    }
  });
}

function startServices(binder, initialState, serviceConfigList) {
  return Promise.all(serviceConfigList.map(function (serviceConfig) {
    return startService(serviceConfig, binder, initialState);
  }));
}

function stopService(serviceConfig, binder) {
  var bindAs = serviceConfig.config.bindAs,
      onStop = serviceConfig.onStop;
  var serviceInBinder = binder.getStore(bindAs).store;
  var onStopFunctionName = onStop || 'onStop';

  if (serviceInBinder) {
    binder.unbind(bindAs);

    if (typeof serviceInBinder[onStopFunctionName] === 'function') {
      serviceInBinder[onStopFunctionName]();
    }
  }
}

function stopServices(binder, serviceConfigList) {
  if (!serviceConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }

  serviceConfigList.forEach(function (serviceConfig) {
    stopService(serviceConfig, binder);
  });
}