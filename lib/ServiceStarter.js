'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceStarter = function () {
  function ServiceStarter() {
    _classCallCheck(this, ServiceStarter);

    this.stratedServices = {};
    this.waiters = {};
  }

  _createClass(ServiceStarter, [{
    key: 'register',
    value: function register(service) {
      var conf = service.getConfig();

      if (conf.bindAs) {
        this.stratedServices[conf.bindAs] = service;
      }
      this.processExpected(service);
    }
  }, {
    key: 'waitFor',
    value: function waitFor(service) {
      var result = false;
      var conf = service.getConfig();
      var promises = void 0;
      var depsError = void 0;

      if (conf.waitFor && conf.waitFor.length) {
        depsError = this.chekDeps(conf.bindAs, conf.waitFor, this.waiters);

        if (!depsError) {
          promises = this.processWaiting(service);
          result = promises.length ? Promise.all(promises) : false;
        } else {
          console.error('ServiceStarter error. "' + conf.bindAs + '": ' + depsError + '.');
        }
      }

      return result;
    }
  }, {
    key: 'processWaiting',
    value: function processWaiting(service) {
      var _this = this;

      var conf = service.getConfig();
      var result = false;

      conf.waitFor.forEach(function (item) {
        if (!_this.stratedServices[item]) {
          if (!result) {
            result = [];
          }

          result.push(new Promise(function (resolve, reject) {
            _this.addWaiter(service, item, resolve, reject);
          }));
        }
      });
      return result;
    }
  }, {
    key: 'processExpected',
    value: function processExpected(service) {
      var conf = service.getConfig();
      var waiters = this.waiters[conf.bindAs];
      if (waiters && waiters.length) {
        waiters.forEach(function (item) {
          item.resolve();
        });
      }
    }
  }, {
    key: 'addWaiter',
    value: function addWaiter(waiterService, expected, resolve, reject) {
      if (!this.waiters[expected]) {
        this.waiters[expected] = [];
      }
      this.waiters[expected].push({ waiterService: waiterService, resolve: resolve, reject: reject });
    }
  }, {
    key: 'goByChain',
    value: function goByChain(hash, entry, currentPoint, chain) {
      if (!chain[currentPoint]) {
        chain[currentPoint] = 1;
        for (var point in hash[currentPoint]) {
          if (!hash[currentPoint].hasOwnProperty(point)) {
            continue;
          }
          if (point !== entry) {
            return this.goByChain(hash, entry, point, chain);
          }

          return 'Loading conflict with"' + entry + '"';
        }
      }
    }
  }, {
    key: 'chekDeps',
    value: function chekDeps(bindAs, waitFor, waiters) {
      var _this2 = this;

      var result = false;
      var chain = {};
      var hash = {};

      if (waitFor.length) {
        _lodash2.default.each(waiters, function (data, service) {
          data.forEach(function (item) {
            var conf = item.waiterService.getConfig();
            var waiterName = conf.bindAs;

            if (!hash[waiterName]) {
              hash[waiterName] = {};
            }
            hash[waiterName][service] = 1;
          });
        });

        if (!hash[bindAs]) {
          hash[bindAs] = {};
        }

        waitFor.forEach(function (item) {
          hash[bindAs][item] = 1;
        });
      }

      _lodash2.default.each(hash, function (data, point) {
        var error = _this2.goByChain(hash, point, point, chain);
        if (error) {
          result = error;
        }
      });

      return result;
    }
  }]);

  return ServiceStarter;
}();

exports.default = ServiceStarter;