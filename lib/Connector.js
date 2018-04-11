'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _mobxReact = require('mobx-react');

var _lodash = require('lodash');

var _util = require('./util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function ConnectorF(Component) {
  var _class, _class2, _temp2;

  var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var options = Object.assign({
    wairForServices: true,
    services: [],
    test: 0
  }, opt);

  var Connector = (0, _mobxReact.observer)(_class = (_temp2 = _class2 = function (_React$Component) {
    _inherits(Connector, _React$Component);

    function Connector() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, Connector);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Connector.__proto__ || Object.getPrototypeOf(Connector)).call.apply(_ref, [this].concat(args))), _this), _this.servicesLoaded = false, _this.options = {}, _this.componentId = '', _this.apiResolved = null, _this.storeInitializator = false, _this.store = null, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Connector, [{
      key: 'getChildContext',
      value: function getChildContext() {
        return {
          store: this.store
        };
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        this.servicesLoaded = false;
        this.options = options;
        this.componentId = Component.name + '_' + (0, _util.getUid)();

        if (this.options.services.length) {
          Promise.all(this.options.services.map(function (service) {
            return service.start(_this2.componentId);
          })).then(function () {
            _this2.initComponent();

            if (_this2.options.wairForServices) {
              _this2.forceUpdate();
            }
          });
        }

        if (!this.options.services.length || !this.options.wairForServices) {
          this.initComponent();
        }
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        var _this3 = this;

        if (this.store && this.store.destroy && this.storeInitializator) {
          this.store.destroy();
        }

        if (this.options.services) {
          this.options.services.forEach(function (service) {
            if (!service.config.unstoppable) {
              service.stop(_this3.componentId);
            }
          });
        }
      }
    }, {
      key: 'initComponent',
      value: function initComponent() {
        this.servicesLoaded = true;
        this.apiResolved = null;
        this.storeInitializator = this.options.store && typeof this.options.store === 'function';
        this.store = this.resolveStore(this.options.store || this.props.store); // eslint-disable-line

        if (this.store && this.store.start) {
          this.store.start(this.componentId);
        }
        this.resolveApi(this.store);
      }
    }, {
      key: 'resolveStore',
      value: function resolveStore(store) {
        var storeToResolve = store || this.context.store;
        var resolved = typeof storeToResolve === 'function' ? storeToResolve.call(this) : storeToResolve;

        if (typeof store === 'function' && !resolved) {
          console.warn('Connector. In component "' + Component.name + '" store not resolved"');
        }

        return resolved;
      }
    }, {
      key: 'resolveApi',
      value: function resolveApi(store) {
        var api = {};
        var componentId = this.componentId;

        if (store && store.api) {
          (0, _lodash.each)(store.api, function (value, key) {
            if (typeof value === 'function') {
              api[key] = function () {
                var _store$binder;

                for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  arg[_key2] = arguments[_key2];
                }

                return (_store$binder = store.binder).callApi.apply(_store$binder, [store.getConfig().bindAs, key, componentId].concat(arg));
              };
            } else {
              console.warn('Connector. For "' + Component.name + '" api \n            function "' + key + '" not found in store "' + (0, _util.protoName)(store) + '"');
            }
          });
          this.apiResolved = api;
        }
      }
    }, {
      key: 'composeProps',
      value: function composeProps() {
        var composed = void 0;
        var helper = void 0;
        var result = {};
        var o = this.options;

        if (typeof o !== 'undefined') {
          helper = typeof o === 'function' ? o : o.helper;
        }

        (0, _lodash.each)(this.props, function (value, key) {
          if (key !== 'store') {
            result[key] = value;
          }
        });

        if (helper) {
          composed = helper.call(this, this.store);
          (0, _lodash.forIn)(composed, function (item, key) {
            if (result[key]) {
              console.warn('Connector. For "' + Component.name + '" variable name "' + key + '" exists in the helper and props.');
            }
            result[key] = item;
          });

          return composed !== undefined ? result : undefined;
        }

        return result;
      }
    }, {
      key: 'render',
      value: function render() {
        if (this.options.wairForServices && !this.servicesLoaded) {
          return null;
        }

        var props = this.composeProps();
        var comp = null;

        if (props !== undefined) {
          if (this.apiResolved) {
            props.api = this.apiResolved;
          }
          comp = _react2.default.createElement(Component, props);
        }

        return comp;
      }
    }]);

    return Connector;
  }(_react2.default.Component), _class2.displayName = Component.displayName && Component.displayName + 'Connector' || Component.name + 'Connector', _class2.childContextTypes = {
    store: _propTypes2.default.object
  }, _class2.contextTypes = {
    store: _propTypes2.default.object
  }, _temp2)) || _class;

  return Connector;
}

exports.default = ConnectorF;