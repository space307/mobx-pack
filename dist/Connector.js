"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _mobxReact = require("mobx-react");

var _lodash = require("lodash");

var _util = require("./helper/util.js");

function ConnectorF(Component) {
  var _class, _temp;

  var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = Object.assign({
    preLoader: null,
    wairForServices: true,
    services: [],
    test: 0
  }, opt);
  return (0, _mobxReact.observer)((_temp = _class =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(Connector, _React$Component);

    function Connector() {
      var _getPrototypeOf2;

      var _this;

      (0, _classCallCheck2.default)(this, Connector);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = (0, _possibleConstructorReturn2.default)(this, (_getPrototypeOf2 = (0, _getPrototypeOf3.default)(Connector)).call.apply(_getPrototypeOf2, [this].concat(args)));
      _this.servicesLoaded = false;
      _this.options = {};
      _this.componentId = '';
      _this.apiResolved = null;
      _this.storeInitializator = false;
      _this.store = null;
      return _this;
    }

    (0, _createClass2.default)(Connector, [{
      key: "getChildContext",
      value: function getChildContext() {
        return {
          store: this.store
        };
      }
    }, {
      key: "componentWillMount",
      value: function componentWillMount() {
        var _this2 = this;

        this.servicesLoaded = false;
        this.options = options;
        this.componentId = "".concat(Component.name, "_").concat((0, _util.getUid)());

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
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        var _this3 = this;

        if (this.store && this.storeInitializator) {
          if (typeof this.store.destroy === 'function') {
            this.store.destroy();
          }

          this.store.stop(this.componentId);
        }

        if (this.options.services) {
          this.options.services.forEach(function (service) {
            if (!service.config || !service.config.unstoppable) {
              service.stop(_this3.componentId);
            }
          });
        }
      }
    }, {
      key: "initComponent",
      value: function initComponent() {
        this.servicesLoaded = true;
        this.apiResolved = null;
        this.storeInitializator = this.options.store && typeof this.options.store === 'function' || this.props.store && typeof this.props.store === 'function';
        this.store = this.resolveStore(this.options.store || this.props.store); // eslint-disable-line

        if (this.store && this.storeInitializator) {
          this.store.start(this.componentId);
        }

        this.resolveApi(this.store);
      }
    }, {
      key: "resolveStore",
      value: function resolveStore(store) {
        var storeToResolve = store || this.context.store;
        var resolved = typeof storeToResolve === 'function' ? storeToResolve.call(this) : storeToResolve;

        if (typeof store === 'function' && !resolved) {
          console.warn("Connector. In component \"".concat(Component.name, "\" store not resolved\""));
        }

        return resolved;
      }
    }, {
      key: "resolveApi",
      value: function resolveApi(store) {
        var api = {};
        var componentId = this.componentId;

        if (store && store.api) {
          (0, _lodash.each)(store.api, function (apiMethod, key) {
            if (typeof apiMethod === 'function') {
              api[key] = store.callApi ? function () {
                var _store$binder;

                for (var _len2 = arguments.length, arg = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  arg[_key2] = arguments[_key2];
                }

                return (_store$binder = store.binder).callApi.apply(_store$binder, [store.getConfig().bindAs, key, componentId].concat(arg));
              } : apiMethod.bind(store);
            } else {
              console.warn("Connector. For \"".concat(Component.name, "\" api \n            function \"").concat(key, "\" not found in store \"").concat((0, _util.protoName)(store), "\""));
            }
          });
          this.apiResolved = api;
        }
      }
    }, {
      key: "composeProps",
      value: function composeProps() {
        var composed;
        var helper;
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
              console.warn("Connector. For \"".concat(Component.name, "\" variable name \"").concat(key, "\" exists in the helper and props."));
            }

            result[key] = item;
          });
          return composed !== undefined ? result : undefined;
        }

        return result;
      }
    }, {
      key: "render",
      value: function render() {
        if (this.options.wairForServices && !this.servicesLoaded) {
          return typeof this.options.preLoader === 'function' ? _react.default.createElement(this.options.preLoader, null) : this.options.preLoader;
        }

        var props = this.composeProps();
        var comp = null;

        if (props !== undefined) {
          if (this.apiResolved) {
            props.api = this.apiResolved;
          }

          comp = _react.default.createElement(Component, props);
        } else {
          return typeof this.options.preLoader === 'function' ? _react.default.createElement(this.options.preLoader, null) : this.options.preLoader;
        }

        return comp;
      }
    }]);
    return Connector;
  }(_react.default.Component), _class.displayName = Component.displayName && "".concat(Component.displayName, "Connector") || "".concat(Component.name, "Connector"), _class.childContextTypes = {
    store: _propTypes.default.object
  }, _class.contextTypes = {
    store: _propTypes.default.object
  }, _temp));
}

var _default = ConnectorF;
exports.default = _default;
//# sourceMappingURL=Connector.js.map