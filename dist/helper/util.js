"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUid = getUid;
exports.protoName = protoName;
exports.isClass = isClass;

function getUid() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 12)).toUpperCase();
}

function protoName(object) {
  return Object.getPrototypeOf(object).constructor.name;
}

function isClass(func) {
  return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
}
//# sourceMappingURL=util.js.map