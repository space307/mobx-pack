export function getUid() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 12)).toUpperCase();
}

export function protoName(object) {
  return Object.getPrototypeOf(object).constructor.name;
}
