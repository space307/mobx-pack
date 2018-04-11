'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mobx = require('mobx');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Binder = function () {
  function Binder() {
    _classCallCheck(this, Binder);

    this.stores = {};
  }

  _createClass(Binder, [{
    key: 'bind',
    value: function bind(store) {
      var _this = this;

      var config = store.getConfig();
      var bindAs = config.bindAs;

      if (typeof bindAs !== 'string' || !bindAs.length) {
        this.showMessage('Store "' + (0, _util.protoName)(store) + '" has not valid "bindAs" id "' + bindAs + '".', 'error');
        return;
      }

      if (this.isBinded(bindAs)) {
        this.showMessage('Store "' + bindAs + '" was already bind.', 'warn');
        return;
      }

      this.addStore(store);

      if (this.isDebug(bindAs)) {
        this.showMessage('"' + bindAs + '" bind.');
      }

      _lodash2.default.each(this.stores, function (item) {
        if (item) {
          _this.processStore(item, _this.getStore(bindAs));
          _this.processStore(_this.getStore(bindAs), item);
        }
      });

      _lodash2.default.each(this.stores, function (item) {
        if (item) {
          if (item.bindHash && item.bindHash[bindAs]) {
            _this.notifyOnBind(item);
          }
        }
      });

      this.notifyOnBind(this.getStore(bindAs));
    }
  }, {
    key: 'addStore',
    value: function addStore(store) {
      var config = store.getConfig();
      var bindAs = config.bindAs;
      var bindHash = {};
      if (config.onBind) {
        config.onBind.forEach(function (arr) {
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
        onBind: _lodash2.default.cloneDeep(config.onBind),
        importData: Object.assign({}, config.importData || {}),
        disposers: {
          list: [],
          services: {}
        }
      };
    }
  }, {
    key: 'showMessage',
    value: function showMessage(msg) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';

      if (type === 'info') {
        console.log('Binder. ' + msg);
      } else if (type === 'warn') {
        console.warn('Binder. ' + msg);
      } else if (type === 'error') {
        console.error('Binder. ' + msg);
      }
    }
  }, {
    key: 'notifyOnBind',
    value: function notifyOnBind(store) {
      var _this2 = this;

      if (store.onBind) {
        store.onBind.forEach(function (onBindItem) {
          var bindCnt = 0;
          var cb = onBindItem[onBindItem.length - 1];
          onBindItem.forEach(function (storeName) {
            if (typeof storeName !== 'function') {
              if (_this2.getStore(storeName).store) {
                bindCnt++;
              }
            }
          });
          if (bindCnt === onBindItem.length - 1 && typeof cb === 'function') {
            cb.call(store.store);
          }
        });
      }
    }
  }, {
    key: 'isDebug',
    value: function isDebug(bindAs) {
      var s = this.getStore(bindAs).store;
      return s && s.config ? s.config.debug : false;
    }
  }, {
    key: 'processStore',
    value: function processStore(from, to) {
      var _this3 = this;

      if (from.bindAs !== to.bindAs) {
        var importData = to.importData;

        if (importData[from.bindAs]) {
          _lodash2.default.each(importData[from.bindAs], function (toVarName, fromVarName) {

            if (!(fromVarName in from.store)) {

              _this3.showMessage('Variable "' + fromVarName + '" required for "' + to.bindAs + '" not found in "' + from.bindAs + '"', 'warn');
              return;
            }

            if (toVarName in to.store) {
              _this3.showMessage('Trying create link from "' + from.bindAs + '.' + fromVarName + '" to "' + to.bindAs + '.' + toVarName + '", but variable "' + toVarName + '" is already exist in "' + to.bindAs + '"', 'warn');
              return;
            }

            Object.defineProperty(to.store, toVarName, { get: function get() {
                if (_this3.isDebug(to.bindAs)) {
                  _this3.showMessage('Variable "' + fromVarName + '" from "' + from.bindAs + '" was taken by "' + to.bindAs + '" with name "' + toVarName + '"');
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
    key: 'addDisposer',
    value: function addDisposer(bindAs, services, obsr) {
      var _this4 = this;

      var storeSettings = this.getStore(bindAs);
      var pass = true;

      services.forEach(function (serviceName) {
        if (!_this4.isBinded(serviceName)) {
          _this4.showMessage('Imposible add disposer for not bind service "' + bindAs + '".', 'warn');
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
    key: 'isBinded',
    value: function isBinded(bindAs) {
      return !!(this.stores[bindAs] && this.stores[bindAs].store);
    }
  }, {
    key: 'getStore',
    value: function getStore(bindAs) {
      return this.stores[bindAs] || {};
    }
  }, {
    key: 'unbind',
    value: function unbind(store) {
      var _this5 = this;

      var config = store.getConfig();
      var bindAs = config.bindAs;
      var storeSettings = this.getStore(bindAs);

      if (_lodash2.default.isEmpty(storeSettings)) {
        this.showMessage('Not binded store "' + bindAs + '" try to unbind!', 'warn');
        return;
      }

      // unbind data exporting to other stores
      _lodash2.default.each(this.stores, function (item) {
        if (item) {
          var importData = item.importData[bindAs];
          // console.log([importData]);
          if (importData) {
            // console.log(['unbind data exporting to other stores', item.bindAs, importData]);
            _this5.unbindData(item.bindAs, importData);
          }
        }
      });

      // unbind data importing from other stores
      _lodash2.default.each(storeSettings.importData, function (importData) {
        _this5.unbindData(bindAs, importData);
      });

      // unbind disposers in this store
      storeSettings.disposers.list.forEach(function (disposer) {
        if (typeof disposer === 'function') {
          disposer();
        }
      });

      // unbind disposers in other stores
      this.unbindDisposers(bindAs);

      // clear store settings in binder
      this.stores[bindAs] = undefined;

      if (this.isDebug(bindAs)) {
        this.showMessage('"' + bindAs + '" unbind.');
      }
    }
  }, {
    key: 'unbindData',
    value: function unbindData(bindAs, importData) {
      var store = this.getStore(bindAs).store;
      _lodash2.default.each(importData, function (toVarName) {
        if (toVarName in store) {
          Object.defineProperty(store, toVarName, { value: undefined });
        }
      });
    }
  }, {
    key: 'unbindDisposers',
    value: function unbindDisposers(bindAs) {
      _lodash2.default.each(this.stores, function (store) {
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
    key: 'importVar',
    value: function importVar(storeName, varName, initiator, raw) {
      var s = this.getStore(storeName);
      var store = s && s.store ? s.store : null;
      var val = void 0;
      var exportData = void 0;

      if (s && s.store) {
        exportData = store.getConfig().exportData;

        if (exportData && !exportData[varName]) {
          console.warn('Warnning! Impossible import variable "' + varName + '" of "' + store.getConfig().bindAs + '" for "' + initiator + '" because variable is not included to config.exportData.');
          return;
        }

        val = store[varName];
        if (store.getConfig().debug) {
          console.log('Binder. "' + initiator + '" import variable "' + varName + '" from "' + storeName + '".', val);
        }
        return raw ? val : (0, _mobx.toJS)(val);
      }

      console.warn('Warnning! importVar form "' + (0, _util.protoName)(this) + '" to "' + initiator + '". "' + storeName + '" store not found.');

      return undefined;
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
    key: 'callApi',
    value: function callApi(storeName, actionName, initiator) {

      if (process.env.NODE_ENV === 'test') {
        return;
      }
      var s = this.getStore(storeName);
      var storeInst = void 0;

      if (s && s.store) {
        storeInst = s.store;

        for (var _len = arguments.length, arg = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          arg[_key - 3] = arguments[_key];
        }

        if (s.store.getConfig().debug) {
          console.log('Binder callApi. "' + initiator + '" calls method "' + actionName + '" from "' + storeName + '".', arg);
        }

        if (storeInst.api && storeInst.api[actionName]) {
          return storeInst.api[actionName].apply(storeInst, arg);
        } else {
          console.warn('CallApi warn. "' + initiator + '" calls unknown method "' + actionName + '" found in store "' + storeName + '".');
        }

        // s.store[actionName].apply(s.store, arg);
      } else {
        console.warn('CallApi warn. "' + initiator + '" calls method "' + actionName + '" from not bind store "' + storeName + '".');
      }
    }
  }]);

  return Binder;
}();

exports.default = Binder;