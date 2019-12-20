"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _events = _interopRequireDefault(require("events"));

var EventEmitter =
/*#__PURE__*/
function () {
  function EventEmitter() {
    (0, _classCallCheck2.default)(this, EventEmitter);
    this.emitter = new _events.default();
  }

  (0, _createClass2.default)(EventEmitter, [{
    key: "emit",
    value: function emit(eventType, payload) {
      this.emitter.emit(eventType, payload);
    }
  }, {
    key: "subscribe",
    value: function subscribe(eventType, cb) {
      this.emitter.on(eventType, cb);
    }
  }, {
    key: "removeAllListeners",
    value: function removeAllListeners() {
      this.emitter.removeAllListeners();
    }
  }, {
    key: "removeListener",
    value: function removeListener(eventName, listener) {
      this.emitter.removeListener(eventName, listener);
    }
  }]);
  return EventEmitter;
}();

exports.default = EventEmitter;
//# sourceMappingURL=EventEmitter.js.map