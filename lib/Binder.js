"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _lodash = require("lodash");

var _mobx = require("mobx");

var _util = require("./util");

var Binder =
/*#__PURE__*/
function () {
  function Binder() {
    (0, _classCallCheck2.default)(this, Binder);
    this.stores = {};
  }

  (0, _createClass2.default)(Binder, [{
    key: "bind",
    value: function bind(store, options) {
      var _this = this;

      var bindAs = options.bindAs;

      if (typeof bindAs !== 'string' || !bindAs.length) {
        this.showMessage("Store \"".concat((0, _util.protoName)(store), "\" has not valid \"bindAs\" id \"").concat(bindAs, "\"."), 'error');
        return;
      }

      if (this.isBinded(bindAs)) {
        this.showMessage("Store \"".concat(bindAs, "\" was already bind."), 'warn');
        return;
      }

      this.addStore(store, options);

      if (this.isDebug(bindAs)) {
        this.showMessage("\"".concat(bindAs, "\" bind."));
      }

      (0, _lodash.each)(this.stores, function (item) {
        if (item) {
          _this.processStore(item, _this.getStore(bindAs));

          _this.processStore(_this.getStore(bindAs), item);
        }
      });
      (0, _lodash.each)(this.stores, function (item) {
        if (item) {
          if (item.bindHash && item.bindHash[bindAs]) {
            _this.notifyOnBind(item);
          }
        }
      });
      this.notifyOnBind(this.getStore(bindAs));
    }
  }, {
    key: "addStore",
    value: function addStore(store, options) {
      var bindAs = options.bindAs;
      var bindHash = {};

      if (options.onBind) {
        options.onBind.forEach(function (arr) {
          arr.forEach(function (storeName) {
            if (typeof storeName !== 'function') {
              bindHash[storeName] = 1;
            }
          });
        });
      }

      this.stores[bindAs] = {
        bindAs: bindAs,
        store: store,
        bindHash: bindHash,
        options: (0, _lodash.cloneDeep)(options),
        notifyOnBind: {},
        disposers: {
          list: [],
          services: {}
        }
      };
    }
  }, {
    key: "showMessage",
    value: function showMessage(msg) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';

      if (type === 'info') {
        console.log("Binder. ".concat(msg));
      } else if (type === 'warn') {
        console.warn("Binder. ".concat(msg));
      } else if (type === 'error') {
        console.error("Binder. ".concat(msg));
      }
    }
  }, {
    key: "notifyOnBind",
    value: function notifyOnBind(store) {
      var _this2 = this;

      if (store.options.onBind) {
        store.options.onBind.forEach(function (onBindItem, index) {
          var bindCnt = 0;
          var storeList = [];
          var cb = onBindItem[onBindItem.length - 1];
          onBindItem.forEach(function (storeName) {
            if (typeof storeName !== 'function') {
              if (_this2.getStore(storeName).store) {
                bindCnt++;
                storeList.push(_this2.getStore(storeName).store);
              }
            }
          });

          if (bindCnt === onBindItem.length - 1 && !store.notifyOnBind[index]) {
            var onBindCb = cb;

            if (typeof onBindCb === 'string' && typeof store.store[onBindCb] === 'function') {
              onBindCb = store.store[onBindCb];
            }

            onBindCb.apply(store.store, storeList);
            store.notifyOnBind[index] = true;
          }
        });
      }
    }
  }, {
    key: "isDebug",
    value: function isDebug(bindAs) {
      var s = this.getStore(bindAs);
      return s && s.options ? s.options.debug : false;
    }
  }, {
    key: "processStore",
    value: function processStore(from, to) {
      var _this3 = this;

      if (from.bindAs !== to.bindAs) {
        var importData = to.options.importData;

        if (importData && importData[from.bindAs]) {
          (0, _lodash.each)(importData[from.bindAs], function (toVarName, fromVarName) {
            if (!(fromVarName in from.store)) {
              _this3.showMessage("Variable \"".concat(fromVarName, "\" required for \"").concat(to.bindAs, "\" \n            not found in \"").concat(from.bindAs, "\""), 'warn');

              return;
            }

            if (toVarName in to.store) {
              _this3.showMessage("Trying create link from \"".concat(from.bindAs, ".").concat(fromVarName, "\" \n            to \"").concat(to.bindAs, ".").concat(toVarName, "\", but variable \"").concat(toVarName, "\" is already exist in \"").concat(to.bindAs, "\""), 'warn');

              return;
            }

            Object.defineProperty(to.store, toVarName, {
              get: function get() {
                if (_this3.isDebug(to.bindAs)) {
                  _this3.showMessage("Variable \"".concat(fromVarName, "\" from \"").concat(from.bindAs, "\" \n              was taken by \"").concat(to.bindAs, "\" with name \"").concat(toVarName, "\""));
                }

                return from.store[fromVarName];
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
      var _this4 = this;

      var storeSettings = this.getStore(bindAs);
      var pass = true;
      services.forEach(function (serviceName) {
        if (!_this4.isBinded(serviceName)) {
          _this4.showMessage("Imposible add disposer for not bind service \"".concat(bindAs, "\"."), 'warn');

          pass = false;
        }
      });

      if (pass) {
        storeSettings.disposers.list.push(obsr);
        services.forEach(function (serviceName) {
          if (!storeSettings.disposers.services[serviceName]) {
            storeSettings.disposers.services[serviceName] = [];
          }

          storeSettings.disposers.services[serviceName].push(storeSettings.disposers.list.length - 1);
        });
      }

      return pass;
    }
  }, {
    key: "isBinded",
    value: function isBinded(bindAs) {
      return !!(this.stores[bindAs] && this.stores[bindAs].store);
    }
  }, {
    key: "getStore",
    value: function getStore(bindAs) {
      return this.stores[bindAs] || {};
    }
  }, {
    key: "unbind",
    value: function unbind(bindAs) {
      var _this5 = this;

      var storeSettings = this.getStore(bindAs);

      if ((0, _lodash.isEmpty)(storeSettings)) {
        this.showMessage("Not binded store \"".concat(bindAs, "\" try to unbind!"), 'warn');
        return;
      } // unbind data exporting to other stores


      (0, _lodash.each)(this.stores, function (item) {
        if (item) {
          var importData = item.options.importData && item.options.importData[bindAs];

          if (importData) {
            // console.log(['unbind data exporting to other stores', item.bindAs, importData]);
            _this5.unbindData(item.bindAs, importData);
          }
        }
      }); // unbind data importing from other stores

      if (storeSettings.options.importData) {
        (0, _lodash.each)(storeSettings.options.importData, function (importData) {
          _this5.unbindData(bindAs, importData);
        });
      } // unbind disposers in this store


      storeSettings.disposers.list.forEach(function (disposer) {
        if (typeof disposer === 'function') {
          disposer();
        }
      }); // unbind disposers in other stores

      this.unbindDisposers(bindAs); // clear store settings in binder

      this.stores[bindAs] = undefined;

      if (this.isDebug(bindAs)) {
        this.showMessage("\"".concat(bindAs, "\" unbind."));
      }
    }
  }, {
    key: "unbindData",
    value: function unbindData(bindAs, importData) {
      var _this$getStore = this.getStore(bindAs),
          store = _this$getStore.store;

      (0, _lodash.each)(importData, function (toVarName) {
        if (toVarName in store) {
          Object.defineProperty(store, toVarName, {
            value: undefined
          });
        }
      });
    }
  }, {
    key: "unbindDisposers",
    value: function unbindDisposers(bindAs) {
      (0, _lodash.each)(this.stores, function (store) {
        if (store && store.disposers.services[bindAs]) {
          store.disposers.services[bindAs].forEach(function (disposer) {
            if (typeof store.disposers.list[disposer] === 'function') {
              store.disposers.list[disposer]();
              store.disposers.list[disposer] = undefined;
            }
          });
        }
      });
    }
    /**
     * Отдаёт значение переменной из стора, привязанного к биндеру
     * @public
     * @param {string} storeName
     * @param {string} varName
     * @param {string} initiator
     * @param {boolean} raw
     * @returns {mixed}
     */

  }, {
    key: "importVar",
    value: function importVar(storeName, varName, initiator, raw) {
      var s = this.getStore(storeName);
      var store = s && s.store ? s.store : null;
      var val;
      var exportData;

      if (s && s.store) {
        exportData = s.options.exportData;

        if (exportData && !exportData[varName]) {
          console.warn("Warnning! Impossible import variable \"".concat(varName, "\" of \n        \"").concat(s.bindAs, "\" for \"").concat(initiator, "\" because variable is not included to config.exportData."));
          return;
        }

        val = store[varName];

        if (s.debug) {
          console.log("Binder. \"".concat(initiator, "\" import variable \"").concat(varName, "\" from \"").concat(storeName, "\"."), val);
        }

        return raw ? val : (0, _mobx.toJS)(val); // eslint-disable-line
      }

      console.warn("Warnning! importVar form \"".concat((0, _util.protoName)(this), "\" to \"").concat(initiator, "\". \"").concat(storeName, "\" store not found."));
      return undefined; // eslint-disable-line
    }
    /**
     * Вызвает метод описанный в api стора с параметрами
     * @public
     * @param {string} storeName
     * @param {string} actionName
     * @param {string} initiator
     * @param {array} arg
     */

  }, {
    key: "callApi",
    value: function callApi(storeName, actionName, initiator) {
      if (process.env.NODE_ENV === 'test') {
        return;
      }

      var s = this.getStore(storeName);
      var storeInst;

      if (s && s.store) {
        storeInst = s.store;

        for (var _len = arguments.length, arg = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          arg[_key - 3] = arguments[_key];
        }

        if (s.options.debug) {
          console.log("Binder callApi. \"".concat(initiator, "\" calls method \"").concat(actionName, "\" from \"").concat(storeName, "\"."), arg);
        }

        if (storeInst.api && storeInst.api[actionName]) {
          return storeInst.api[actionName].apply(storeInst, arg); // eslint-disable-line
        }

        console.warn("CallApi warn. \"".concat(initiator, "\" calls unknown method \"").concat(actionName, "\" found in store \"").concat(storeName, "\".")); // s.store[actionName].apply(s.store, arg);
      } else {
        console.warn("CallApi warn. \"".concat(initiator, "\" calls method \"").concat(actionName, "\" from not bind store \"").concat(storeName, "\"."));
      }
    }
  }]);
  return Binder;
}();

var _default = Binder;
exports.default = _default;