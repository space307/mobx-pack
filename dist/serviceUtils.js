"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createService = createService;
exports.startService = startService;
exports.startServices = startServices;
exports.stopService = stopService;
exports.stopServices = stopServices;
exports.getStartedServices = getStartedServices;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function createService(Service, protoAttrs) {
  if (protoAttrs && !Array.isArray(protoAttrs)) {
    throw new Error("Wrong ServiceParams! (".concat(Service.name, ")"));
  }

  return protoAttrs ? (0, _construct2.default)(Service, (0, _toConsumableArray2.default)(protoAttrs)) : new Service();
}

function startService(binder, initialState, serviceStartConfig) {
  var binderConfig = serviceStartConfig.binderConfig,
      proto = serviceStartConfig.proto;
  var config = binderConfig.config,
      bindAs = binderConfig.config.bindAs,
      onStart = binderConfig.onStart;
  var result;
  var resolver = binder.getPendingStartResolver(bindAs);
  var serviceInBinder = binder.getService(bindAs);
  var onStartFunctionName = onStart || 'onStart';

  if (serviceInBinder) {
    result = Promise.resolve({
      service: serviceInBinder,
      started: false,
      serviceStartConfig: serviceStartConfig
    });
  } else if (resolver) {
    result = resolver;
  } else {
    result = new Promise(function (resolve, reject) {
      var service = createService(proto, serviceStartConfig.protoAttrs);
      var resolveData = {
        service: service,
        started: true,
        serviceStartConfig: serviceStartConfig
      };

      if (!service[onStartFunctionName]) {
        binder.bind(service, config);
        resolve(resolveData);
        return;
      }

      var onStartResult = service[onStartFunctionName](initialState);

      if (onStartResult instanceof Promise) {
        onStartResult.then(function () {
          binder.bind(service, config);
          resolve(resolveData);
        }).catch(function (err) {
          reject(err);
        });
      } else if (onStartResult === true) {
        binder.bind(service, config);
        resolve(resolveData);
      } else {
        reject(new Error("Service ".concat(bindAs, " onStart return \"false\"")));
      }
    }).finally(function () {
      binder.setPendingStartResolver(bindAs, null);
    });
    binder.setPendingStartResolver(bindAs, result);
  }

  return result;
}

function startServices(binder, initialState, serviceStartConfigList) {
  return Promise.all(serviceStartConfigList.map(function (serviceStartConfig) {
    return startService(binder, initialState, serviceStartConfig);
  }));
}

function stopService(binder, serviceStartConfig) {
  var _serviceStartConfig$b = serviceStartConfig.binderConfig,
      bindAs = _serviceStartConfig$b.config.bindAs,
      onStop = _serviceStartConfig$b.onStop;
  var serviceInBinder = binder.getService(bindAs);
  var onStopFunctionName = onStop || 'onStop';

  if (serviceInBinder) {
    binder.unbind(bindAs);

    if (typeof serviceInBinder[onStopFunctionName] === 'function') {
      serviceInBinder[onStopFunctionName]();
    }
  }
}

function stopServices(binder, serviceStartConfigList) {
  if (!serviceStartConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }

  serviceStartConfigList.forEach(function (ServiceProto) {
    stopService(binder, ServiceProto);
  });
}

function getStartedServices(binder, serviceStartConfigList) {
  var services = [];
  serviceStartConfigList.forEach(function (ServiceProto) {
    var bindAs = ServiceProto.binderConfig.config.bindAs;
    var service = binder.getService(bindAs);

    if (service) {
      services.push(service);
    }
  });
  return services.length === serviceStartConfigList.length ? services : null;
}