"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STATUS_SERVICE_FAIL = exports.STATUS_SERVICE_STOPPED = exports.STATUS_SERVICE_STOPPING = exports.STATUS_SERVICE_STARTED = exports.STATUS_SERVICE_STARTING = exports.STATUS_SERVICE_SLEEP = void 0;

var _initializerDefineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerDefineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _initializerWarningHelper2 = _interopRequireDefault(require("@babel/runtime/helpers/initializerWarningHelper"));

var _lodash = _interopRequireDefault(require("lodash"));

var _mobx = require("mobx");

var _util = require("./helper/util.js");

var _class, _descriptor, _descriptor2, _descriptor3, _class2, _temp;

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
    (0, _classCallCheck2.default)(this, BaseStore);
    this.disposers = [];
    this.disposerKeys = {};
    this.binder = void 0;
    this.mounted = false;
    (0, _initializerDefineProperty2.default)(this, "serviceStatus", _descriptor, this);
    (0, _initializerDefineProperty2.default)(this, "serviceReady", _descriptor2, this);
    (0, _initializerDefineProperty2.default)(this, "serviceWasStarted", _descriptor3, this);
    this.serviceFail = null;
    this.alreadyStarting = false;
    this.alreadyStopping = false;
    this.initiators = [];

    if (context) {
      this.binder = context.binder;
      this.serviceStarter = context.serviceStarter;
    }
  }

  (0, _createClass2.default)(BaseStore, [{
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

      if (!initiatorId) {
        initiatorId = 'unknown';
      }

      var starting = this.alreadyStarting;
      this.alreadyStarting = true;
      return starting ? new Promise(function (resolve) {
        _this2.initiators.push(initiatorId);

        _this2.startOk(resolve);
      }) : new Promise(function (resolve, reject) {
        // eslint-disable-line
        if (_this2.serviceStatus !== STATUS_SERVICE_SLEEP && _this2.serviceStatus !== STATUS_SERVICE_STOPPED) {
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
      var result; // TODO придумать как выпилить this.getConfig()

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
      var config = this.getConfig();

      if (Object.prototype.hasOwnProperty.call(config, 'bindAs')) {
        if (!this.binder.isBind(config.bindAs)) {
          this.binder.bind(this, config);
        }
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

      return (_this$binder = this.binder).callApi.apply(_this$binder, [from, methodName, this.getConfig().config].concat(arg));
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
}(), _class2.instance = null, _temp), (_descriptor = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "serviceStatus", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return STATUS_SERVICE_SLEEP;
  }
}), _descriptor2 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "serviceReady", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor3 = (0, _applyDecoratedDescriptor2.default)(_class.prototype, "serviceWasStarted", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return false;
  }
})), _class);
exports.default = BaseStore;
//# sourceMappingURL=BaseStore.js.map