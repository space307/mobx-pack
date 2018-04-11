'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUid = getUid;
exports.setCookie = setCookie;
exports.getCookie = getCookie;
exports.protoName = protoName;
function getUid() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 12)).toUpperCase();
}

function setCookie(key, value, sec, host) {
  var dateStr = void 0;
  var currentDate = new Date();

  host = host || 'olymptrade.com';
  currentDate.setTime(currentDate.getTime() + 1000 * sec);
  dateStr = currentDate.toGMTString();
  document.cookie = key + '=' + JSON.stringify(value) + '; expires=' + dateStr + '; path=/; domain=.' + host;
}

function getCookie(name) {
  var cookie = ' ' + document.cookie;
  var search = ' ' + name + '=';
  var setStr = null;
  var offset = 0;
  var end = 0;

  if (cookie.length > 0) {
    offset = cookie.indexOf(search);
    if (offset !== -1) {
      offset += search.length;
      end = cookie.indexOf(';', offset);
      if (end === -1) {
        end = cookie.length;
      }
      setStr = decodeURIComponent(cookie.substring(offset, end));

      try {
        setStr = JSON.parse(setStr);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return setStr;
}

function protoName(object) {
  return Object.getPrototypeOf(object).constructor.name;
}