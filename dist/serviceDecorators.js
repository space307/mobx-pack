"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindAs = bindAs;
exports.onBind = onBind;
exports.onUnbind = onUnbind;
exports.onStart = onStart;
exports.onStop = onStop;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _lodash = require("lodash");

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
    onStart: [],
    onStop: '',
    bindAs: '',
    onBind: [],
    onUnbind: []
  };
}

function prepareConfig(service) {
  if (!service.binderConfig) {
    service.binderConfig = createConfig();
  } else {
    service.binderConfig = (0, _lodash.cloneDeep)(service.binderConfig);
  }
}

function putServiceNamesToConfig(serviceNames, service, callbackName, optionName) {
  var pushToArray = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

  if (serviceNames && serviceNames.length && callbackName) {
    serviceNames.forEach(function (serviceName) {
      if (!validateName(serviceName)) {
        throw new Error("Wrong service name \"".concat(serviceName, "\" \n          passed to function \"").concat(callbackName, "\" decorator (service:").concat(service.name, ")."));
      }
    });

    if (pushToArray) {
      var existCallback = service.binderConfig[optionName].find(function (callback) {
        return (0, _lodash.last)(callback) === callbackName;
      });

      if (existCallback === undefined) {
        service.binderConfig[optionName].push([].concat((0, _toConsumableArray2.default)(serviceNames), [callbackName]));
      } else {
        existCallback.splice.apply(existCallback, [0, existCallback.length].concat((0, _toConsumableArray2.default)(serviceNames), [callbackName]));
      }
    } else {
      service.binderConfig[optionName] = [].concat((0, _toConsumableArray2.default)(serviceNames), [callbackName]);
    }
  }
}

function putMethodNameToConfig(service, callbackName, optionName) {
  service.binderConfig[optionName] = callbackName;
}

function bindAs(serviceName) {
  if (typeof serviceName === 'function') {
    throw new Error("Wrong attributes passed to bindAs decorator (service:".concat(serviceName.name, ")."));
  }

  return function (service) {
    if (!validateName(serviceName)) {
      throw new Error("Wrong name \"".concat(serviceName, "\" passed to bindAs decorator (service:").concat(service.name, ")."));
    }

    prepareConfig(service);
    service.binderConfig.bindAs = serviceName;
    return service;
  };
}

function onBind() {
  for (var _len = arguments.length, serviceNames = new Array(_len), _key = 0; _key < _len; _key++) {
    serviceNames[_key] = arguments[_key];
  }

  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error("Wrong attributes passed to onBind decorator (".concat(serviceNames.join(','), ")."));
  }

  return function (service, callbackName) {
    var proto = service.constructor;
    prepareConfig(proto);
    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onBind');
    return service;
  };
}

function onUnbind() {
  for (var _len2 = arguments.length, serviceNames = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    serviceNames[_key2] = arguments[_key2];
  }

  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error("Wrong attributes passed to onUnbind decorator (".concat(serviceNames.join(','), ")."));
  }

  return function (service, callbackName) {
    var proto = service.constructor;
    prepareConfig(proto);
    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onUnbind');
    return service;
  };
}

function onStart() {
  for (var _len3 = arguments.length, serviceNames = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    serviceNames[_key3] = arguments[_key3];
  }

  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error("Wrong attributes passed to onStart decorator (".concat(serviceNames.join(','), ")."));
  }

  return function (service, callbackName) {
    var proto = service.constructor;
    prepareConfig(proto);
    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onStart', false);
    return service;
  };
}

function onStop(service, callbackName) {
  var proto = service.constructor;
  prepareConfig(proto);
  putMethodNameToConfig(proto, callbackName, 'onStop');
  return service;
}
