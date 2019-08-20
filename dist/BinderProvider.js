"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createBinderProvider;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _react = _interopRequireDefault(require("react"));

var _Binder = _interopRequireDefault(require("./Binder.js"));

/**
 * BinderProvider creates new binder context and provide in to child components through react context
 */
function createBinderProvider(BinderContext) {
  return function BinderProvider(Component) {
    var ComponentWrapper =
    /*#__PURE__*/
    function (_React$Component) {
      (0, _inherits2.default)(ComponentWrapper, _React$Component);

      function ComponentWrapper(props, context) {
        var _this;

        (0, _classCallCheck2.default)(this, ComponentWrapper);
        _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ComponentWrapper).call(this));
        _this.state = {
          error: null
        };
        _this.newContext = void 0;
        _this.newContext = new _Binder.default(context);

        if (!Component || typeof Component !== 'function') {
          _this.state.error = 'BinderProvider wait for "React.Component" in attributes';
        }

        return _this;
      }

      (0, _createClass2.default)(ComponentWrapper, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this.newContext) {
            this.newContext.clear();
          }
        }
      }, {
        key: "render",
        value: function render() {
          if (this.state.error) {
            throw new Error(this.state.error);
          }

          return _react.default.createElement(BinderContext.Provider, {
            value: this.newContext
          }, _react.default.createElement(Component, this.props));
        }
      }]);
      return ComponentWrapper;
    }(_react.default.Component);

    ComponentWrapper.contextType = BinderContext;
    return ComponentWrapper;
  };
}
//# sourceMappingURL=BinderProvider.js.map