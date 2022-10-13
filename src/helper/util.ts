export function getUid() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 12)).toUpperCase();
}

export function protoName(object: object): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  return Object.getPrototypeOf(object).constructor.name;
}

export function isClass(func: unknown) {
  return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
}
