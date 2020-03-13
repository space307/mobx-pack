"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _lodash = require("lodash");

var _mobx = require("mobx");

var _util = require("./helper/util");

var _EventEmitter = _interopRequireDefault(require("./helper/EventEmitter.js"));

/* eslint-disable method-can-be-static, class-methods-use-this, no-console */

/**
 * Binder - is a DI implementation class. Some classes may to communicate to each other through Binder.
 * Binder register services and call callback functions to resolve dependencies of one service to another
 *
 * Binder operation algorithm
 *  - While service binding to Binder or unbind it notify other services whose
 *  are waiting for it and provide the list of callbacks
 *  which should be called then other services will bind to Binder or unbind too.
 */
var EMITTER_EVENT = {
  BIND: 'BIND',
  UNBIND: 'UNBIND',
  CALLBACK_CALLED: 'CALLBACK_CALLED'
};
var CALLBACK_NAME = {
  BIND: 'onBind',
  UNBIND: 'onUnbind'
};
var MESSAGE_TYPES = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info'
};

var Binder =
/*#__PURE__*/
function () {
  function Binder(parentBinder) {
    var _this$depsList,
        _this = this;

    (0, _classCallCheck2.default)(this, Binder);
    this.services = {};
    this.depsList = (_this$depsList = {}, (0, _defineProperty2.default)(_this$depsList, CALLBACK_NAME.BIND, {}), (0, _defineProperty2.default)(_this$depsList, CALLBACK_NAME.UNBIND, {}), _this$depsList);
    this.pendingStartResolvers = {};
    this.parentBinder = void 0;
    this.emitter = new _EventEmitter.default();
    this.allowParentOperation = false;

    if (parentBinder instanceof Binder) {
      this.parentBinder = parentBinder;
      (0, _lodash.each)(parentBinder.services, function (_ref) {
        var service = _ref.service,
            options = _ref.options;

        _this.addService(service, options);
      });
      parentBinder.emitter.subscribe(EMITTER_EVENT.BIND, function (_ref2) {
        var service = _ref2.service,
            options = _ref2.options;

        _this.bind(service, options);
      });
      parentBinder.emitter.subscribe(EMITTER_EVENT.UNBIND, function (bindAs) {
        _this.allowParentOperation = true;

        _this.unbind(bindAs);

        _this.allowParentOperation = false;
      });
    }
  }

  (0, _createClass2.default)(Binder, [{
    key: "createService",
    value: function createService(Service, protoAttrs) {
      if (protoAttrs && !Array.isArray(protoAttrs)) {
        throw new Error("Wrong ServiceParams! (".concat(Service.name, ")"));
      }

      return protoAttrs ? (0, _construct2.default)(Service, (0, _toConsumableArray2.default)(protoAttrs)) : new Service();
    }
    /**
     * start and bind service
     */

  }, {
    key: "start",
    value: function start(serviceStartConfig) {
      var _this2 = this;

      var binderConfig = serviceStartConfig.binderConfig,
          proto = serviceStartConfig.proto;
      var bindAs = binderConfig.bindAs,
          onStart = binderConfig.onStart;
      var result;
      var resolver = this.getPendingStartResolver(bindAs);
      var serviceInBinder = this.getService(bindAs);

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
          var service = serviceStartConfig.factory ? serviceStartConfig.factory() : _this2.createService(proto, serviceStartConfig.protoAttrs);

          if (!service || (0, _typeof2.default)(service) !== 'object') {
            throw Error("Binder service start error. Service \"".concat(bindAs, "\" is not a valid object"));
          } else if (!(service instanceof proto)) {
            throw Error("Binder service start error. Service \"".concat(bindAs, "\"\n            prototype does not match service factory result"));
          }

          var resolveData = {
            service: service,
            started: true,
            serviceStartConfig: serviceStartConfig
          };
          var onStartResult;

          if (onStart && !Array.isArray(onStart)) {
            throw Error("Binder onStart error. onStart callback of \"".concat(bindAs, "\" is not valid"));
          }

          if (onStart && onStart.length) {
            var _this2$destructCallba = _this2.destructCallback(onStart),
                callback = _this2$destructCallba.callback,
                serviceList = _this2$destructCallba.serviceList;

            if (!_this2.isListBind(serviceList)) {
              // eslint-disable-next-line max-len
              throw Error("Binder onStart error. onStart callback of \"".concat(bindAs, "\" wait for service list (").concat(serviceList ? serviceList.join(',') : '', ") to be bind, but some services are not bind ").concat(_this2.getNotBind(serviceList).join(',')));
            }

            var funcToCall = _this2.parseCallback(callback, service);

            if (funcToCall) {
              onStartResult = funcToCall.apply(service, _this2.getServiceList(serviceList));
            }
          }

          if (typeof onStartResult === 'undefined') {
            _this2.bind(service, binderConfig);

            resolve(resolveData);
          } else if (onStartResult instanceof Promise) {
            onStartResult.then(function () {
              _this2.bind(service, binderConfig);

              resolve(resolveData);
            }).catch(function (err) {
              reject(err);
            });
          } else if (onStartResult === true) {
            _this2.bind(service, binderConfig);

            resolve(resolveData);
          } else {
            reject(new Error("Service ".concat(bindAs, " onStart return \"false\"")));
          }
        }).finally(function () {
          _this2.setPendingStartResolver(bindAs, null);
        });
        this.setPendingStartResolver(bindAs, result);
      }

      return result;
    }
    /**
     * stop and unbind service
     */

  }, {
    key: "stop",
    value: function stop(serviceStartConfig) {
      var _serviceStartConfig$b = serviceStartConfig.binderConfig,
          bindAs = _serviceStartConfig$b.bindAs,
          onStop = _serviceStartConfig$b.onStop;
      var serviceInBinder = this.getService(bindAs);
      var onStopFunctionName = onStop || 'onStop';

      if (serviceInBinder) {
        this.unbind(bindAs);

        if (typeof serviceInBinder[onStopFunctionName] === 'function') {
          serviceInBinder[onStopFunctionName]();
        }
      }
    }
    /**
     * bind service to the binder
     */

  }, {
    key: "bind",
    value: function bind(service, options) {
      var _this3 = this;

      if (!options) {
        throw new Error('Binder options is not valid');
      }

      var bindAs = options.bindAs;

      if (typeof bindAs !== 'string' || !bindAs.length) {
        throw new Error("Service \"".concat((0, _util.protoName)(service), "\" has not valid \"bindAs\" id \"").concat(bindAs, "\"."));
      }

      this.validateCallback(options, CALLBACK_NAME.BIND);
      this.validateCallback(options, CALLBACK_NAME.UNBIND);

      if (this.isBind(bindAs)) {
        throw new Error("Service \"".concat(bindAs, "\" was already bind."));
      }

      if ((0, _typeof2.default)(service) !== 'object') {
        throw new Error("Service bind param is not an object (\"".concat(bindAs, "\")."));
      }

      this.addService(service, options);
      /* -- Legacy -- */

      if (this.isDebug(bindAs)) {
        this.showMessage("\"".concat(bindAs, "\" bind."));
      }

      (0, _lodash.each)(this.services, function (item) {
        if (item) {
          _this3.processService(item, _this3.getServiceSettings(bindAs));

          _this3.processService(_this3.getServiceSettings(bindAs), item);
        }
      });
      /* --/ Legacy -- */
      // save OnBind dependencies of the current service

      this.saveDeps(bindAs, CALLBACK_NAME.BIND); // save OnUnbind dependencies of the current service

      this.saveDeps(bindAs, CALLBACK_NAME.UNBIND); // check anf resolve dependencies for OnBind events

      this.handleOnBind(bindAs); // emmit event for child Binders

      this.emitter.emit(EMITTER_EVENT.BIND, {
        service: service,
        options: options
      });
    }
    /**
     * add service to the storage of services
     */

  }, {
    key: "addService",
    value: function addService(service, options) {
      var bindAs = options.bindAs;
      var optionsCopy = (0, _lodash.cloneDeep)(options);

      if (optionsCopy.onUnbind) {
        optionsCopy.onUnbind.forEach(function (item) {
          // eslint-disable-next-line no-param-reassign
          item.__locked = true;
        });
      }

      this.services[bindAs] = {
        bindAs: bindAs,
        service: service,
        options: optionsCopy,
        disposers: {
          list: [],
          services: {}
        }
      };
    }
    /**
     * look over all OnBind callbacks and resolve dependencies
     */

  }, {
    key: "handleOnBind",
    value: function handleOnBind(bindAs) {
      var _this4 = this;

      var settings = this.getServiceSettings(bindAs);

      if (settings) {
        var onBindCallbackSetList = settings.options && settings.options[CALLBACK_NAME.BIND];
        var onUnbindCallbackSetList = settings.options && settings.options[CALLBACK_NAME.UNBIND]; // check and execute OnBind dependencies of other services on the current service

        this.handleOnBindItem(bindAs); // check and execute OnUnbind dependencies of other services on the current service

        this.handleOnUnbindItem(bindAs); // check and execute OnBind dependencies from the list of dependencies of the current service

        this.lookOverCallback(onBindCallbackSetList, function (serviceName) {
          _this4.handleOnBindItem(serviceName);
        }); // check and execute OnUnbind dependencies from the list of dependencies of the current service

        this.lookOverCallback(onUnbindCallbackSetList, function (serviceName) {
          _this4.handleOnUnbindItem(serviceName);
        });
      }
    }
    /**
     * handle OnBind callback item to resolve it
     */

  }, {
    key: "handleOnBindItem",
    value: function handleOnBindItem(bindAs) {
      var _this5 = this;

      this.lookOverDeps(bindAs, CALLBACK_NAME.BIND, function (depBindAs, callbackSet, service) {
        var _this5$destructCallba = _this5.destructCallback(callbackSet),
            callback = _this5$destructCallba.callback,
            serviceList = _this5$destructCallba.serviceList;

        if (!callbackSet.__locked && _this5.isListBind(serviceList)) {
          _this5.applyCallback(depBindAs, callbackSet, serviceList, callback, service, CALLBACK_NAME.BIND);
        } else {
          _this5.checkCallBackResolved(depBindAs, callbackSet, serviceList);
        }
      });
    }
    /**
     * look over all OnUnbind callbacks and resolve dependencies
     */

  }, {
    key: "handleOnUnbind",
    value: function handleOnUnbind(bindAs) {
      var _this6 = this;

      this.lookOverDeps(bindAs, CALLBACK_NAME.BIND, function (depBindAs, callbackSet) {
        var _this6$destructCallba = _this6.destructCallback(callbackSet),
            serviceList = _this6$destructCallba.serviceList;

        if (callbackSet.__locked && _this6.isListUnBind(serviceList)) {
          // eslint-disable-next-line no-param-reassign
          delete callbackSet.__locked;
        }
      });
      this.lookOverDeps(bindAs, CALLBACK_NAME.UNBIND, function (depBindAs, callbackSet, service) {
        var _this6$destructCallba2 = _this6.destructCallback(callbackSet),
            callback = _this6$destructCallba2.callback,
            serviceList = _this6$destructCallba2.serviceList;

        if (!callbackSet.__locked && _this6.isListUnBind(serviceList)) {
          _this6.applyCallback(depBindAs, callbackSet, serviceList, callback, service, CALLBACK_NAME.UNBIND);
        }
      });
    }
    /**
     * handle OnUnbind callback item to resolve it
     */

  }, {
    key: "handleOnUnbindItem",
    value: function handleOnUnbindItem(bindAs) {
      var _this7 = this;

      this.lookOverDeps(bindAs, CALLBACK_NAME.UNBIND, function (depBindAs, callbackSet) {
        var _this7$destructCallba = _this7.destructCallback(callbackSet),
            serviceList = _this7$destructCallba.serviceList;

        if (_this7.isListBind(serviceList) && callbackSet.__locked) {
          // eslint-disable-next-line no-param-reassign
          delete callbackSet.__locked;
        }
      });
    }
    /**
     * check if callback was resolved if not send warning to console
     */

  }, {
    key: "checkCallBackResolved",
    value: function checkCallBackResolved(bindAs, callbackSet, serviceList) {
      var _this8 = this;

      if (callbackSet.__resolveTM) {
        clearTimeout(callbackSet.__resolveTM);
      } // eslint-disable-next-line no-param-reassign


      callbackSet.__resolveTM = setTimeout(function () {
        var notBind = _this8.getNotBind(serviceList);

        var cbName = callbackSet[callbackSet.length - 1];

        if (serviceList && notBind.length && notBind.length < serviceList.length) {
          _this8.showMessage("\"".concat(bindAs, ".").concat(typeof cbName === 'string' ? cbName : CALLBACK_NAME.BIND, "\"\n        not called, because \"").concat(notBind.join(','), "\" still not resolved."), MESSAGE_TYPES.WARN);
        } // eslint-disable-next-line no-param-reassign


        delete callbackSet.__resolveTM;
      }, 1000);
    }
    /**
     * apply callback
     */

  }, {
    key: "applyCallback",
    value: function applyCallback(bindAs, callbackSet, serviceList, callback, service, callbackType) {
      var funcToCall = this.parseCallback(callback, service);

      if (funcToCall) {
        funcToCall.apply(service, callbackType === CALLBACK_NAME.BIND ? this.getServiceList(serviceList) : []); // eslint-disable-next-line no-param-reassign

        callbackSet.__locked = true;
        this.emitter.emit(EMITTER_EVENT.CALLBACK_CALLED, {
          bindAs: bindAs,
          callbackType: callbackType,
          callback: callback,
          serviceList: serviceList
        });
      } else {
        throw new Error("".concat(callbackType, " method\n      ").concat(typeof callback === 'string' ? callback : '', " not found in \"").concat(bindAs, "\"."));
      }
    }
    /**
     * get list of service id and return service instance list
     */

  }, {
    key: "getServiceList",
    value: function getServiceList(serviceList) {
      var _this9 = this;

      return serviceList ? serviceList.reduce(function (acc, bindAs) {
        var service = _this9.getService(bindAs);

        if (service) {
          acc.push(service);
        }

        return acc;
      }, []) : [];
    }
    /**
     * look over callback list of the service and every iteration call function which was passed as attribute
     */

  }, {
    key: "lookOverCallback",
    value: function lookOverCallback(callbackSetList, cb) {
      if (callbackSetList) {
        callbackSetList.forEach(function (callbackSet) {
          var len = callbackSet.length;
          callbackSet.forEach(function (serviceName, i) {
            if (i < len - 1) {
              cb(serviceName);
            }
          });
        });
      }
    }
    /**
     * look over dependency list of the service and every iteration call function which was passed as attribute
     */

  }, {
    key: "lookOverDeps",
    value: function lookOverDeps(bindAs, callbackType, cb) {
      var _this10 = this;

      var list = this.depsList[callbackType][bindAs];

      if (list && list.length) {
        list.forEach(function (depBindAs) {
          var settings = _this10.getServiceSettings(depBindAs);

          if (settings) {
            var callbackSetList = settings.options && settings.options[callbackType];

            var _service = _this10.getService(depBindAs);

            if (callbackSetList) {
              callbackSetList.forEach(function (callbackSet) {
                if ((0, _lodash.includes)(callbackSet, bindAs)) {
                  // $FlowIgnore
                  cb(depBindAs, callbackSet, _service);
                }
              });
            }
          }
        });
      }
    }
    /**
     * validate callback set data format
     */

  }, {
    key: "validateCallback",
    value: function validateCallback(options, callbackName) {
      var bindAs = options.bindAs;
      var list = options[callbackName];

      if (list && list.length) {
        if (!Array.isArray(list[0])) {
          throw new Error("Service \"".concat(bindAs, "\" ").concat(callbackName, " should contains\n        Array on callback data\""));
        } else {
          this.lookOverCallback(list, function (serviceName) {
            if (bindAs === serviceName) {
              throw new Error("Service \"".concat(bindAs, "\" ").concat(callbackName, " callback contains\n          the same name as service name \"").concat(bindAs, "\""));
            }
          });
          list.forEach(function (callback) {
            if (callback.length < 2) {
              throw new Error("Service \"".concat(bindAs, "\" ").concat(callbackName, " should contains\n        Array this at least 2 items, but ").concat(callback.length, " given [").concat(callback.join(','), "].\""));
            }
          });
        }
      }
    }
    /**
     * parse callback
     */

  }, {
    key: "parseCallback",
    value: function parseCallback(callback, service) {
      if (typeof callback === 'function') {
        return callback;
      } else if (typeof service[callback] === 'function') {
        return service[callback];
      }

      return null;
    }
    /**
     * return true if all services from list are bind
     */

  }, {
    key: "isListBind",
    value: function isListBind(list) {
      var _this11 = this;

      return list ? list.reduce(function (acc, bindAs) {
        if (!_this11.isBind(bindAs)) {
          // eslint-disable-next-line no-param-reassign
          acc = false;
        }

        return acc;
      }, true) : false;
    }
    /**
     * return list of ids for services which are not bind
     */

  }, {
    key: "getNotBind",
    value: function getNotBind(list) {
      var _this12 = this;

      return list ? list.reduce(function (acc, bindAs) {
        if (!_this12.isBind(bindAs)) {
          acc.push(bindAs);
        }

        return acc;
      }, []) : [];
    }
    /**
     * return true if all services from list are unbind
     */

  }, {
    key: "isListUnBind",
    value: function isListUnBind(list) {
      var _this13 = this;

      return list ? list.reduce(function (acc, bindAs) {
        if (_this13.isBind(bindAs)) {
          // eslint-disable-next-line no-param-reassign
          acc = false;
        }

        return acc;
      }, true) : true;
    }
    /**
     * return true if service bind to parent Binder
     */

  }, {
    key: "isBindOnParent",
    value: function isBindOnParent(bindAs) {
      return !!(this.parentBinder && this.parentBinder.isBind(bindAs));
    }
    /**
     * destruct callback set to service list and callback function or function name
     */

  }, {
    key: "destructCallback",
    value: function destructCallback(list) {
      var len = list && list.length;
      var callback = len ? list[len - 1] : null;
      var serviceList = len ? list.slice(0, len - 1) : null;
      return {
        serviceList: serviceList,
        callback: callback
      };
    }
    /**
     * return true if service bind
     */

  }, {
    key: "isBind",
    value: function isBind(bindAs) {
      return !!(this.services[bindAs] && this.services[bindAs].service);
    }
    /**
     * return settings of the service
     */

  }, {
    key: "getServiceSettings",
    value: function getServiceSettings(bindAs) {
      return this.services[bindAs];
    }
    /**
     * save hash of dependencies of one service to another
     */

  }, {
    key: "saveDeps",
    value: function saveDeps(bindAs, callbackType) {
      var _this14 = this;

      if (this.isBindOnParent(bindAs)) {
        return;
      }

      var settings = this.getServiceSettings(bindAs);

      if (settings) {
        var deps = settings.options && settings.options[callbackType];

        if (deps && deps.length) {
          deps.forEach(function (list) {
            var len = list && list.length;
            list.forEach(function (item, i) {
              if (i < len - 1) {
                if (!_this14.depsList[callbackType][item]) {
                  _this14.depsList[callbackType][item] = [];
                }

                if (!(0, _lodash.includes)(_this14.depsList[callbackType][item], bindAs)) {
                  _this14.depsList[callbackType][item].push(bindAs);
                }
              }
            });
          });
        }
      }
    }
    /**
     * return promise resolve for starting service
     */

  }, {
    key: "getPendingStartResolver",
    value: function getPendingStartResolver(bindAs) {
      return this.pendingStartResolvers[bindAs];
    }
    /**
     * save promise resolve for starting service to avoid double call of onStart function
     */

  }, {
    key: "setPendingStartResolver",
    value: function setPendingStartResolver(bindAs, resolver) {
      if (resolver) {
        this.pendingStartResolvers[bindAs] = resolver;
      } else {
        delete this.pendingStartResolvers[bindAs];
      }
    }
    /**
     * unbind service
     */

  }, {
    key: "unbind",
    value: function unbind(bindAs) {
      var _this15 = this;

      var serviceSettings = this.getServiceSettings(bindAs);

      if (!this.isBind(bindAs)) {
        this.showMessage("Service \"".concat(bindAs, "\", which are not bind try to unbind!"), MESSAGE_TYPES.WARN);
        return;
      }

      if (this.isBindOnParent(bindAs) && !this.allowParentOperation) {
        throw new Error("Try to unbind service \"".concat(bindAs, "\" from parent Binder."));
      }
      /* -- Legacy -- */
      // unbind data exporting to other services


      (0, _lodash.each)(this.services, function (item) {
        if (item) {
          var importData = item.options.importData && item.options.importData[bindAs];

          if (importData) {
            _this15.unbindData(item.bindAs, importData);
          }
        }
      }); // unbind data importing from other services

      if (serviceSettings && serviceSettings.options.importData) {
        (0, _lodash.each)(serviceSettings.options.importData, function (importData) {
          _this15.unbindData(bindAs, importData);
        });
      } // unbind disposers in this service


      if (serviceSettings && serviceSettings.disposers) {
        serviceSettings.disposers.list.forEach(function (disposer) {
          if (typeof disposer === 'function') {
            disposer();
          }
        });
      } // unbind disposers in other services


      this.unbindDisposers(bindAs);

      if (this.isDebug(bindAs)) {
        this.showMessage("\"".concat(bindAs, "\" unbind."));
      }
      /* --/ Legacy -- */
      // clear service settings in binder


      delete this.services[bindAs]; // check and execute dependencies on the OnUnbind event

      this.handleOnUnbind(bindAs); // emmit event for child services

      this.emitter.emit(EMITTER_EVENT.UNBIND, bindAs);
    }
    /**
     * return bind service
     */

  }, {
    key: "getService",
    value: function getService(bindAs) {
      var settings = this.getServiceSettings(bindAs);
      return settings && settings.service;
    }
    /**
     * clear all binder data besides services
     */

  }, {
    key: "clear",
    value: function clear() {
      var _this$depsList2;

      this.depsList = (_this$depsList2 = {}, (0, _defineProperty2.default)(_this$depsList2, CALLBACK_NAME.BIND, {}), (0, _defineProperty2.default)(_this$depsList2, CALLBACK_NAME.UNBIND, {}), _this$depsList2);
      this.pendingStartResolvers = {};
      this.emitter.clear();
    }
    /**
     * clear all binder data
     */

  }, {
    key: "clearAll",
    value: function clearAll() {
      this.clear();
      this.services = {};
    }
    /**
     * show message to console
     */

  }, {
    key: "showMessage",
    value: function showMessage(msg) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';

      if (process.env.NODE_ENV === 'test') {
        return;
      }

      if (type === MESSAGE_TYPES.INFO) {
        console.log("Binder. ".concat(msg));
      } else if (type === MESSAGE_TYPES.WARN) {
        console.warn("Binder. ".concat(msg));
      } else if (type === MESSAGE_TYPES.ERROR) {
        console.error("Binder. ".concat(msg));
      }
    }
    /* -- Legacy -- */

  }, {
    key: "isDebug",
    value: function isDebug(bindAs) {
      var settings = this.getServiceSettings(bindAs);
      return settings && settings.options ? settings.options.debug : false;
    }
  }, {
    key: "processService",
    value: function processService(from, to) {
      var _this16 = this;

      if (from.bindAs !== to.bindAs) {
        var importData = to.options.importData;

        if (importData && importData[from.bindAs]) {
          (0, _lodash.each)(importData[from.bindAs], function (toVarName, fromVarName) {
            if (!(fromVarName in from.service)) {
              _this16.showMessage("Variable \"".concat(fromVarName, "\" required for \"").concat(to.bindAs, "\"\n            not found in \"").concat(from.bindAs, "\""), MESSAGE_TYPES.WARN);

              return;
            }

            if (toVarName in to.service) {
              _this16.showMessage("Trying create link from \"".concat(from.bindAs, ".").concat(fromVarName, "\"\n            to \"").concat(to.bindAs, ".").concat(toVarName, "\", but variable \"").concat(toVarName, "\" is already exist in \"").concat(to.bindAs, "\""), MESSAGE_TYPES.WARN);

              return;
            }

            Object.defineProperty(to.service, toVarName, {
              get: function get() {
                if (_this16.isDebug(to.bindAs)) {
                  _this16.showMessage("Variable \"".concat(fromVarName, "\" from \"").concat(from.bindAs, "\"\n              was taken by \"").concat(to.bindAs, "\" with name \"").concat(toVarName, "\""));
                }

                return from.service[fromVarName];
              },
              configurable: true
            });
          });
        }
      }
    }
  }, {
    key: "addDisposer",
    value: function addDisposer(bindAs, services, obsr) {
      var _this17 = this;

      var serviceSettings = this.getServiceSettings(bindAs);
      var pass = true;
      services.forEach(function (serviceName) {
        if (!_this17.isBind(serviceName)) {
          _this17.showMessage("Impossible add disposer for not bind service \"".concat(bindAs, "\"."), MESSAGE_TYPES.WARN);

          pass = false;
        }
      });

      if (pass && serviceSettings) {
        serviceSettings.disposers.list.push(obsr);
        services.forEach(function (serviceName) {
          if (!serviceSettings.disposers.services[serviceName]) {
            serviceSettings.disposers.services[serviceName] = [];
          }

          serviceSettings.disposers.services[serviceName].push(serviceSettings.disposers.list.length - 1);
        });
      }

      return pass;
    }
  }, {
    key: "unbindDisposers",
    value: function unbindDisposers(bindAs) {
      (0, _lodash.each)(this.services, function (service) {
        if (service && service.disposers.services[bindAs]) {
          service.disposers.services[bindAs].forEach(function (disposer) {
            if (typeof service.disposers.list[disposer] === 'function') {
              service.disposers.list[disposer](); // eslint-disable-next-line no-param-reassign

              service.disposers.list[disposer] = undefined;
            }
          });
        }
      });
    }
  }, {
    key: "unbindData",
    value: function unbindData(bindAs, importData) {
      var settings = this.getServiceSettings(bindAs);

      if (settings) {
        var _service2 = settings.service;
        (0, _lodash.each)(importData, function (toVarName) {
          if (toVarName in _service2) {
            Object.defineProperty(_service2, toVarName, {
              value: undefined
            });
          }
        });
      }
    }
  }, {
    key: "importVar",
    value: function importVar(serviceName, varName, initiator, raw) {
      var s = this.getServiceSettings(serviceName);
      var service = s && s.service ? s.service : null;
      var val;
      var exportData;

      if (s && s.service && service) {
        exportData = s.options.exportData;

        if (exportData && !exportData[varName]) {
          console.warn("Warnning! Impossible import variable \"".concat(varName, "\" of\n        \"").concat(s.bindAs, "\" for \"").concat(initiator, "\" because variable is not included to config.exportData."));
          return;
        }

        val = service[varName];

        if (s.debug) {
          console.log("Binder. \"".concat(initiator, "\" import variable \"").concat(varName, "\" from \"").concat(serviceName, "\"."), val);
        }

        return raw ? val : (0, _mobx.toJS)(val); // eslint-disable-line
      }

      console.warn("Warnning! importVar form \"".concat((0, _util.protoName)(this), "\" to\n    \"").concat(initiator, "\". \"").concat(serviceName, "\" service not found."));
      return undefined; // eslint-disable-line
    }
  }, {
    key: "callApi",
    value: function callApi(serviceName, actionName, initiator) {
      if (process.env.NODE_ENV === 'test') {
        return;
      }

      var s = this.getServiceSettings(serviceName);
      var serviceInst;

      if (s && s.service) {
        serviceInst = s.service;

        for (var _len = arguments.length, arg = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          arg[_key - 3] = arguments[_key];
        }

        if (s.options.debug) {
          console.log("Binder callApi. \"".concat(initiator, "\" calls method \"").concat(actionName, "\" from \"").concat(serviceName, "\"."), arg);
        }

        if (serviceInst.api && serviceInst.api[actionName]) {
          return serviceInst.api[actionName].apply(serviceInst, arg); // eslint-disable-line
        }

        console.warn("CallApi warn. \"".concat(initiator, "\" calls unknown method\n      \"").concat(actionName, "\" found in service \"").concat(serviceName, "\"."));
      } else {
        console.warn("CallApi warn. \"".concat(initiator, "\" calls method \"").concat(actionName, "\" from not bind service \"").concat(serviceName, "\"."));
      }
    }
    /* --/ Legacy -- */

  }]);
  return Binder;
}();

var _default = Binder;
exports.default = _default;
//# sourceMappingURL=Binder.js.map