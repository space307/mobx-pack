"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindAs = bindAs;
exports.bindServices = bindServices;
exports.unbindServices = unbindServices;
exports.onStart = onStart;
exports.onStop = onStop;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function validateName(name) {
  return !!(name && typeof name === 'string' && /^[A-Za-z][A-Za-z0-9_]+$/.test(name));
}

function validateNameList(list) {
  return list.reduce(function (acc, item) {
    if (!validateName(item)) {
      acc = false;
    }

    return acc;
  }, true);
}

function createConfig() {
  return {
    onStart: '',
    onStop: '',
    config: {
      bindAs: '',
      onBind: [],
      onUnbind: []
    }
  };
}

function putServiceNamesToConfig(serviceNames, service, callbackName, optionName) {
  var proto = service.constructor;

  if (!proto.binderConfig || !proto.binderConfig.config) {
    proto.binderConfig = createConfig();
  }

  if (serviceNames && serviceNames.length && callbackName) {
    serviceNames.forEach(function (serviceName) {
      if (!validateName(serviceName)) {
        throw new Error("Wrong service name \"".concat(serviceName, "\" \n          passed to function \"").concat(callbackName, "\" decorator (service:").concat(proto.name, ")."));
      }
    });
    proto.binderConfig.config[optionName].push([].concat((0, _toConsumableArray2.default)(serviceNames), [callbackName]));
  }
}

function putMethodNameToConfig(service, callbackName, optionName) {
  var proto = service.constructor;

  if (!proto.binderConfig) {
    proto.binderConfig = createConfig();
  }

  proto.binderConfig[optionName] = callbackName;
}

function bindAs(serviceName) {
  if (typeof serviceName === 'function') {
    throw new Error("Wrong attributes passed to bindAs decorator (service:".concat(serviceName.name, ")."));
  }

  return function (service) {
    if (!validateName(serviceName)) {
      throw new Error("Wrong name \"".concat(serviceName, "\" passed to bindAs decorator (service:").concat(service.name, ")."));
    }

    if (!service.binderConfig || !service.binderConfig.config) {
      service.binderConfig = createConfig();
    }

    service.binderConfig.config.bindAs = serviceName;
    return service;
  };
}

function bindServices() {
  for (var _len = arguments.length, serviceNames = new Array(_len), _key = 0; _key < _len; _key++) {
    serviceNames[_key] = arguments[_key];
  }

  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error("Wrong attributes passed to bindServices decorator (".concat(serviceNames.join(','), ")."));
  }

  return function (service, callbackName) {
    putServiceNamesToConfig(serviceNames, service, callbackName, 'onBind');
    return service;
  };
}

function unbindServices() {
  for (var _len2 = arguments.length, serviceNames = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    serviceNames[_key2] = arguments[_key2];
  }

  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error("Wrong attributes passed to unbindServices decorator (".concat(serviceNames.join(','), ")."));
  }

  return function (service, callbackName) {
    putServiceNamesToConfig(serviceNames, service, callbackName, 'onUnbind');
    return service;
  };
}

function onStart(service, callbackName) {
  putMethodNameToConfig(service, callbackName, 'onStart');
  return service;
}

function onStop(service, callbackName) {
  putMethodNameToConfig(service, callbackName, 'onStop');
  return service;
}