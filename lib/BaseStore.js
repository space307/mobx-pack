"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STATUS_SERVICE_FAIL = exports.STATUS_SERVICE_STOPPED = exports.STATUS_SERVICE_STOPPING = exports.STATUS_SERVICE_STARTED = exports.STATUS_SERVICE_STARTING = exports.STATUS_SERVICE_SLEEP = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _mobx = require("mobx");

var _util = require("./util.js");

var _class, _descriptor, _descriptor2, _descriptor3, _class2, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

var STATUS_SERVICE_SLEEP = 'sleep';
exports.STATUS_SERVICE_SLEEP = STATUS_SERVICE_SLEEP;
var STATUS_SERVICE_STARTING = 'starting';
exports.STATUS_SERVICE_STARTING = STATUS_SERVICE_STARTING;
var STATUS_SERVICE_STARTED = 'started';
exports.STATUS_SERVICE_STARTED = STATUS_SERVICE_STARTED;
var STATUS_SERVICE_STOPPING = 'stopping';
exports.STATUS_SERVICE_STOPPING = STATUS_SERVICE_STOPPING;
var STATUS_SERVICE_STOPPED = 'stopped';
exports.STATUS_SERVICE_STOPPED = STATUS_SERVICE_STOPPED;
var STATUS_SERVICE_FAIL = 'fail';
exports.STATUS_SERVICE_FAIL = STATUS_SERVICE_FAIL;
var ON_START = 'onStart';
var ON_STOP = 'onStop';
var BaseStore = (_class = (_temp = _class2 =
/*#__PURE__*/
function () {
  function BaseStore(context) {
    _classCallCheck(this, BaseStore);

    _defineProperty(this, "disposers", []);

    _defineProperty(this, "disposerKeys", {});

    _defineProperty(this, "binder", void 0);

    _defineProperty(this, "mounted", false);

    _defineProperty(this, "serviceStatus", _initializerWarningHelper(_descriptor, this));

    _defineProperty(this, "serviceReady", _initializerWarningHelper(_descriptor2, this));

    _defineProperty(this, "serviceWasStarted", _initializerWarningHelper(_descriptor3, this));

    _defineProperty(this, "serviceFail", null);

    _defineProperty(this, "alreadyStarting", false);

    _defineProperty(this, "alreadyStopping", false);

    _defineProperty(this, "initiators", []);

    if (context) {
      this.binder = context.binder;
      this.serviceStarter = context.serviceStarter;
    }
  }

  _createClass(BaseStore, [{
    key: "start",
    value: function start(initiatorId, context) {
      var _this = this;

      if (context) {
        this.binder = context.binder;
        this.serviceStarter = context.serviceStarter;
      }

      var waitFor = this.serviceStarter.waitFor(this);
      return waitFor ? new Promise(function (resolve, reject) {
        return waitFor.then(function () {
          _this.startDo(initiatorId, _this.serviceStarter).then(function () {
            return resolve();
          }).catch(function (error) {
            return reject(error);
          });
        });
      }) : this.startDo(initiatorId, this.serviceStarter);
    }
  }, {
    key: "startDo",
    value: function startDo(initiatorId) {
      var _this2 = this;

      var starting = this.alreadyStarting;
      this.alreadyStarting = true;
      return starting ? new Promise(function (resolve) {
        _this2.initiators.push(initiatorId);

        _this2.startOk(resolve);
      }) : new Promise(function (resolve, reject) {
        // eslint-disable-line
        if (!initiatorId) {
          reject("Start service \"".concat((0, _util.protoName)(_this2), "\" error. No initiator id."));
        } else if (_this2.serviceStatus !== STATUS_SERVICE_SLEEP && _this2.serviceStatus !== STATUS_SERVICE_STOPPED) {
          reject("Start service \"".concat((0, _util.protoName)(_this2), "\" error. \n                Wrong status \"").concat(_this2.serviceStatus, "\". Initiator - \"").concat(initiatorId, "\""));
        } else {
          // auto bind
          if (_this2.getConfig().autoBind !== false) {
            _this2.bindApp();
          }

          return _this2.proceedService(initiatorId, ON_START, STATUS_SERVICE_STARTING, STATUS_SERVICE_STARTED).then(function () {
            resolve();
          }).catch(function (e) {
            reject(e);
          });
        }
      }).then(function () {
        _this2.initiators.push(initiatorId);

        return new Promise(function (resolve) {
          _this2.startOk(resolve);
        });
      }).catch(function (err) {
        console.warn(err);
        return new Promise(function (resolve, reject) {
          reject(err);
        });
      });
    }
  }, {
    key: "startOk",
    value: function startOk(resolve) {
      if (this.serviceStarter) {
        this.serviceStarter.register(this);
      }

      resolve();
    }
  }, {
    key: "stop",
    value: function stop(initiatorId) {
      var _this3 = this;

      var stopping = this.alreadyStopping;
      return stopping ? new Promise(function (resolve) {
        resolve();
      }) : new Promise(function (resolve, reject) {
        if (!initiatorId) {
          resolve();
        } else if (_lodash.default.indexOf(_this3.initiators, initiatorId) === -1) {
          reject("Stop service \"".concat((0, _util.protoName)(_this3), "\" error. Initiator with id \"").concat(initiatorId, "\" not found."));
        } else if (_this3.serviceStatus === STATUS_SERVICE_STARTED || _this3.serviceStatus === STATUS_SERVICE_STARTING || _this3.serviceStatus === STATUS_SERVICE_FAIL) {
          _lodash.default.remove(_this3.initiators, function (n) {
            return n === initiatorId;
          });

          resolve();
        } else {
          resolve(true);
        }
      }).then(function (alreadyStopped) {
        var result = false;

        if ((alreadyStopped || _this3.initiators.length) && initiatorId) {
          result = new Promise(function (resolve) {
            resolve(_this3.initiators.length);
          });
        } else {
          _this3.alreadyStopping = true;
          result = _this3.proceedService(initiatorId, ON_STOP, STATUS_SERVICE_STOPPING, STATUS_SERVICE_STOPPED);
        }

        return result;
      });
    }
  }, {
    key: "proceedService",
    value: function proceedService(id, fn, state1, state2) {
      var _this4 = this;

      var initiator = id || 'unknown';
      return new Promise(function (resolve, reject) {
        var result = _this4[fn]();

        if (result instanceof Promise) {
          _this4.setServiceStatus(state1);

          result.then(function () {
            _this4.setServiceStatus(state2);

            resolve();
          }).catch(function (e) {
            _this4.setServiceStatus(STATUS_SERVICE_FAIL, "".concat(state1, "_fail"));

            var error = typeof e === 'string' ? new Error(e) : e;
            e.serviceError = "Service:\"".concat((0, _util.protoName)(_this4), "\", initing by \"").concat(initiator, "\" has status \"").concat(_this4.serviceFail, "\"");
            reject(error);
          });
        } else if (result) {
          _this4.setServiceStatus(state2);

          resolve();
        } else {
          _this4.setServiceStatus(STATUS_SERVICE_FAIL, "".concat(state1, "_fail"));

          reject(new Error("Service:\"".concat((0, _util.protoName)(_this4), "\", initing by \"").concat(initiator, "\" has status \"").concat(_this4.serviceFail, "\"")));
        }
      });
    }
  }, {
    key: "setServiceFail",
    value: function setServiceFail(msg) {
      this.setServiceStatus(STATUS_SERVICE_FAIL, "".concat(msg, "_fail"));
    }
  }, {
    key: "setServiceStarted",
    value: function setServiceStarted() {
      this.setServiceStatus(STATUS_SERVICE_STARTED);
    }
  }, {
    key: "setServiceStatus",
    value: function setServiceStatus(status, failDesc) {
      this.alreadyStarting = status === STATUS_SERVICE_STARTING || status === STATUS_SERVICE_STARTED;
      this.serviceStatus = status;
      this.serviceReady = status === STATUS_SERVICE_STARTED;

      if (status === STATUS_SERVICE_STARTED) {
        this.serviceWasStarted = true;
        this.alreadyStopping = false;
      }

      if (failDesc) {
        this.serviceFail = failDesc;
      }
    }
  }, {
    key: "onStart",
    value: function onStart() {
      return true;
    }
  }, {
    key: "onStop",
    value: function onStop() {
      return true;
    }
    /**
     * Добавляет наблюдателя переменной, при необходимости именуется ключом
     * @public
     * @param {object} obsr
     * @param {string} key
     * @param {array} services
     * @returns {*|disposer}
     */

  }, {
    key: "addObserve",
    value: function addObserve(obsr, key, services) {
      var result; //TODO придумать как выпилить this.getConfig()

      if (!services || !this.binder.addDisposer(this.getConfig().bindAs, services, obsr)) {
        this.disposers.push(obsr);

        if (this.disposerKeys[key]) {
          console.error("Observer with key \"".concat(key, "\" already exists in the store ").concat((0, _util.protoName)(this)));
          result = false;
        } else {
          if (key) {
            this.disposerKeys[key] = this.disposers.length - 1;
          }

          result = this.disposers[this.disposers.length - 1];
        }
      }

      return result;
    }
  }, {
    key: "addObservers",
    value: function addObservers(obsrs, services) {
      var _this5 = this;

      obsrs.forEach(function (obsr) {
        _this5.addObserve(obsr, null, services);
      });
    }
    /**
     * Удаляет именованный ключом наблюдатель переменной
     * @public
     * @param {string} key
     */

  }, {
    key: "_removeObserve",
    value: function _removeObserve(key) {
      if (typeof this.disposerKeys[key] === 'undefined') {
        console.error("Observer with key \"".concat(key, "\" not fount in the store ").concat((0, _util.protoName)(this)));
        return false;
      }

      this.disposers[this.disposerKeys[key]]();
      this.disposers[this.disposerKeys[key]] = null;
      delete this.disposerKeys[key];
      return undefined;
    }
    /**
     * Привязывает стор к глобальному биндеру
     * @public
     * @param {object} bindData
     */

  }, {
    key: "bindApp",
    value: function bindApp() {
      if (Object.prototype.hasOwnProperty.call(this.getConfig(), 'bindAs')) {
        this.binder.bind(this, this.getConfig());
      } else {
        console.warn("Base Store. ".concat((0, _util.protoName)(this), " has no bindAs in config"));
      }
    }
    /**
     * Отвязывает стор от глобального биндера
     * @public
     */

  }, {
    key: "unbindApp",
    value: function unbindApp() {
      if (this.getConfig().bindAs) {
        this.binder.unbind(this.getConfig().bindAs);
      }
    }
  }, {
    key: "callApi",
    value: function callApi(from, methodName) {
      var _this$binder;

      for (var _len = arguments.length, arg = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        arg[_key - 2] = arguments[_key];
      }

      return (_this$binder = this.binder).callApi.apply(_this$binder, [from, methodName, this.getConfig().bindAs].concat(arg));
    }
  }, {
    key: "getConfig",
    value: function getConfig() {
      return this.config || {};
    }
  }, {
    key: "importVar",
    value: function importVar(from, varName, raw) {
      return this.binder.importVar(from, varName, this.getConfig().bindAs, raw);
    }
    /**
     * Вызывается у сторов синглтонов в момент маунта компонента
     * @public
     */

  }, {
    key: "onMount",
    value: function onMount() {}
    /**
     * Вызывается из коннектора в момент маунта компонента
     * @public
     */

  }, {
    key: "onMountInit",
    value: function onMountInit() {
      if (!this.mounted) {
        this.onMount();
      }

      this.mounted = true;
    }
    /**
     * Отвязывает стор от зависимостей перед удалением
     * @public
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.disposers.forEach(function (obsr) {
        obsr();
      });
      this.unbindApp();

      if (this.constructor.instance) {
        this.constructor.instance = null;
      }
    }
  }], [{
    key: "getInstance",
    value: function getInstance(context) {
      if (!this.instance) {
        this.instance = new this(context);
      }

      return this.instance;
    }
  }]);

  return BaseStore;
}(), _defineProperty(_class2, "instance", null), _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "serviceStatus", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return STATUS_SERVICE_SLEEP;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "serviceReady", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "serviceWasStarted", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return false;
  }
})), _class);
exports.default = BaseStore;