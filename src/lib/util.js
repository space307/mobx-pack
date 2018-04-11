export function getUid() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 12)).toUpperCase();
}

export function setCookie(key, value, sec, host) {
  const currentDate = new Date();

  host = host || 'olymptrade.com';
  currentDate.setTime(currentDate.getTime() + (1000 * sec));
  const dateStr = currentDate.toGMTString();
  document.cookie = `${key}=${JSON.stringify(value)}; expires=${dateStr}; path=/; domain=.${host}`;
}

export function getCookie(name) {
  const cookie = ` ${document.cookie}`;
  const search = ` ${name}=`;
  let setStr = null;
  let offset = 0;
  let end = 0;

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
  return (setStr);
}

export function protoName(object) {
  return Object.getPrototypeOf(object).constructor.name;
}
