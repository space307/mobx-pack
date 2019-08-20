"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createProvider;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireDefault(require("react"));

var _mobxReact = require("mobx-react");

var _serviceUtils = require("./serviceUtils.js");

/**
 * Provider start services (or get it from binder context) and pass it to ServiceContext to a child components
 */

/**
 * Convert incoming param with service list to start service format
 */
function convertToServiceStartConfig(ServiceProtoList) {
  return ServiceProtoList.map(function (ServiceProto) {
    if (Array.isArray(ServiceProto) && ServiceProto.length < 2) {
      throw Error('ServiceItem passed in Provider is not valid Array');
    }

    var proto = Array.isArray(ServiceProto) && ServiceProto.length ? ServiceProto[0] : ServiceProto;
    var protoAttrs = Array.isArray(ServiceProto) ? ServiceProto[1] : undefined;

    if (typeof proto !== 'function') {
      throw Error('Object passed as ServiceItem to Provider is not a constructor');
    }

    return {
      proto: proto,
      protoAttrs: protoAttrs,
      binderConfig: proto.binderConfig
    };
  });
}
/**
 * Convert service Array to object for service context provider
 */


function convertToServiceHash(list) {
  return list && list.length ? list.reduce(function (acc, item) {
    if (!item.constructor.binderConfig || !item.constructor.binderConfig.bindAs) {
      throw new Error('Cannot convert service hash because binderConfig or bindAs props not exits');
    }

    var name = item.constructor.binderConfig.bindAs;
    acc[name.charAt(0).toLowerCase() + name.slice(1)] = item;
    return acc;
  }, {}) : null;
}
/**
 * return name of React.Component
 */


function getComponentName(Component) {
  return Component && typeof Component.name === 'string' ? Component.name : 'unknown';
}

function createProvider(BinderContext, ServiceContext) {
  return function Provider(Component, options) {
    var _class, _temp;

    var defaultOptions = {
      stop: false,
      services: []
    };
    return (0, _mobxReact.observer)((_temp = _class =
    /*#__PURE__*/
    function (_React$Component) {
      (0, _inherits2.default)(ProviderComponent, _React$Component);

      function ProviderComponent(props, context) {
        var _this;

        (0, _classCallCheck2.default)(this, ProviderComponent);
        _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ProviderComponent).call(this));
        _this.state = {
          error: null,
          services: null
        };
        _this.options = void 0;
        _this.serviceToStop = [];

        if (!context) {
          _this.state.error = "Binder context not found in Provider \n            (component: ".concat(getComponentName(Component), ")");
        } else if (!Component || typeof Component !== 'function') {
          _this.state.error = 'Provider wait for "React.Component" in attributes';
        } else if (options && options.helper && typeof options.helper !== 'function') {
          _this.state.error = "Helper put to Provider \n            (component: ".concat(getComponentName(Component), ") should be a function");
        }

        if (options) {
          var _services = typeof options.services === 'function' ? options.services(props) : options.services;

          var stop = options.stop,
              helper = options.helper,
              stub = options.stub;
          _this.options = (0, _objectSpread2.default)({}, defaultOptions, {
            stop: stop,
            helper: helper,
            stub: stub
          }, {
            services: _services
          });
        } else {
          _this.options = (0, _objectSpread2.default)({}, defaultOptions);
        }

        if (_this.options.services) {
          var config;

          try {
            config = convertToServiceStartConfig(_this.options.services);
          } catch (err) {
            _this.state.error = "".concat(err.message, " (component: ").concat(getComponentName(Component), ")");
          }

          if (context && config) {
            var serviceList = (0, _serviceUtils.getStartedServices)(context, config);
            _this.state.services = convertToServiceHash(serviceList);
          }
        }

        return _this;
      }
      /**
       * Ser service list to state && for service context provider
       */


      (0, _createClass2.default)(ProviderComponent, [{
        key: "setServices",
        value: function setServices(list) {
          this.setState({
            services: convertToServiceHash(list)
          });
        }
      }, {
        key: "componentDidMount",
        value: function componentDidMount() {
          if ((!this.state.services || !this.state.services.length) && this.context) {
            this.startServices();
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this.options.stop && this.serviceToStop && this.serviceToStop.length) {
            (0, _serviceUtils.stopServices)(this.context, this.serviceToStop);
          }
        }
        /**
         * Start service procedure
         */

      }, {
        key: "startServices",
        value: function startServices() {
          var _this2 = this;

          var ServiceProtoList = this.options.services;
          var binder = this.context;

          if (ServiceProtoList && ServiceProtoList.length) {
            var serviceStartConfigList;

            try {
              serviceStartConfigList = convertToServiceStartConfig(ServiceProtoList);
            } catch (err) {
              this.setState({
                error: "".concat(err.message, " (component: ").concat(getComponentName(Component), ")")
              });
            }

            if (serviceStartConfigList) {
              (0, _serviceUtils.startServices)(binder, serviceStartConfigList).then(function (services) {
                var result = {
                  toStop: [],
                  services: []
                };
                services.reduce(function (acc, _ref) {
                  var service = _ref.service,
                      started = _ref.started,
                      serviceStartConfig = _ref.serviceStartConfig;

                  if (started) {
                    acc.toStop.push(serviceStartConfig);
                  }

                  acc.services.push(service);
                  return acc;
                }, result);
                _this2.serviceToStop = result.toStop;

                _this2.setServices(result.services);
              });
            }
          } else {
            this.setServices([]);
          }
        }
        /**
         * Merge props for wrapped component and call helper
         */

      }, {
        key: "composeProps",
        value: function composeProps(services, props) {
          if (services && (0, _typeof2.default)(this.options.helper)) {
            return this.options.helper ? this.options.helper(services, props) : props;
          }

          return props;
        }
      }, {
        key: "render",
        value: function render() {
          if (this.state.error) {
            throw new Error(this.state.error);
          }

          var props = this.composeProps(this.state.services, this.props);
          var hasService = this.options.services && this.options.services.length;
          var serviceOk = !hasService || this.state.services;
          var helperOk = !this.options.helper || !!props;
          var Stub = this.options.stub;

          if (serviceOk && helperOk) {
            return hasService ? _react.default.createElement(ServiceContext.Provider, {
              value: this.state.services
            }, _react.default.createElement(Component, props)) : _react.default.createElement(Component, props);
          }

          return typeof Stub === 'function' ? _react.default.createElement(Stub, null) : null;
        }
      }]);
      return ProviderComponent;
    }(_react.default.Component), _class.contextType = BinderContext, _temp));
  };
}
//# sourceMappingURL=Provider.js.map