"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createBinderProvider;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _react = _interopRequireDefault(require("react"));

var _Binder = _interopRequireDefault(require("./Binder.js"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function createBinderProvider(BinderContext) {
  return function BinderProvider(Component) {
    var ComponentWrapper = /*#__PURE__*/function (_React$Component) {
      (0, _inherits2["default"])(ComponentWrapper, _React$Component);

      var _super = _createSuper(ComponentWrapper);

      function ComponentWrapper(props, context) {
        var _this;

        (0, _classCallCheck2["default"])(this, ComponentWrapper);
        _this = _super.call(this);
        _this.state = {
          error: null
        };
        _this.newContext = void 0;
        _this.newContext = new _Binder["default"](context);

        if (!Component || typeof Component !== 'function') {
          _this.state.error = 'BinderProvider wait for "React.Component" in attributes';
        }

        return _this;
      }

      (0, _createClass2["default"])(ComponentWrapper, [{
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

          return /*#__PURE__*/_react["default"].createElement(BinderContext.Provider, {
            value: this.newContext
          }, /*#__PURE__*/_react["default"].createElement(Component, this.props));
        }
      }]);
      return ComponentWrapper;
    }(_react["default"].Component);

    ComponentWrapper.contextType = BinderContext;
    return ComponentWrapper;
  };
}
//# sourceMappingURL=BinderProvider.js.map