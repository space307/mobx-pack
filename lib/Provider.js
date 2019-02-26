"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CreateProvider;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireDefault(require("react"));

var _mobxReact = require("mobx-react");

var _serviceUtils = require("./serviceUtils.js");

function CreateProvider(BinderContext, StoreContext) {
  return function Provider(Component, options) {
    var _class, _temp;

    var defaultOptions = {
      stop: false,
      services: []
    };
    return (0, _mobxReact.observer)((_temp = _class =
    /*#__PURE__*/
    function (_React$Component) {
      (0, _inherits2.default)(ConnectorComponent, _React$Component);

      function ConnectorComponent() {
        var _this;

        (0, _classCallCheck2.default)(this, ConnectorComponent);
        _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ConnectorComponent).call(this));
        _this.state = {
          error: null,
          result: null
        };
        _this.options = void 0;
        _this.serviceToStop = [];
        _this.options = (0, _objectSpread2.default)({}, defaultOptions, options);
        return _this;
      }

      (0, _createClass2.default)(ConnectorComponent, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          this.startServices();
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this.options.stop && this.serviceToStop && this.serviceToStop.length) {
            var binder = this.context.binder;
            (0, _serviceUtils.stopServices)(this.serviceToStop, binder);
          }
        }
      }, {
        key: "startServices",
        value: function startServices() {
          var _this2 = this;

          var ServiceConfigList = this.options.services;
          var _this$context = this.context,
              binder = _this$context.binder,
              initialState = _this$context.initialState;

          if (!binder || !initialState) {
            this.setState({
              error: 'binder && initialState not received in Container'
            });
          }

          if (ServiceConfigList && ServiceConfigList.length) {
            (0, _serviceUtils.startServices)(binder, initialState, ServiceConfigList).then(function (services) {
              var result = {
                toStop: [],
                services: []
              };
              services.reduce(function (acc, _ref) {
                var service = _ref.service,
                    started = _ref.started,
                    serviceConfig = _ref.serviceConfig;

                if (started) {
                  acc.toStop.push(serviceConfig);
                }

                acc.services.push(service);
                return acc;
              }, result);
              _this2.serviceToStop = result.toStop;

              _this2.setState({
                result: result.services
              });
            });
          } else {
            this.setState({
              result: []
            });
          }
        }
      }, {
        key: "composeProps",
        value: function composeProps(result, props) {
          return result && this.options.helper ? this.options.helper(result, props) : props;
        }
      }, {
        key: "render",
        value: function render() {
          var props = this.composeProps(this.state.result, this.props);
          var hasService = this.options.services.length;
          var serviceOk = !hasService || this.state.result;
          var helperOk = !this.options.helper || !!props;

          if (serviceOk && helperOk) {
            return hasService ? _react.default.createElement(StoreContext.Provider, {
              value: this.state.result
            }, _react.default.createElement(Component, props)) : _react.default.createElement(Component, props);
          }

          return null;
        }
      }]);
      return ConnectorComponent;
    }(_react.default.Component), _class.contextType = BinderContext, _temp));
  };
}