// @flow

type FunctionParamType<T> = (cb: (payload: T) => void) => void;

export default class Emitter {
  subscribers: Map<FunctionParamType<*>, Array<*>> = new Map();

  subscribe<T>(fn: FunctionParamType<T>, cb: (payload: T) => void): void {
    if (!fn) {
      return;
    }

    const subs = this.subscribers.get(fn);

    if (!subs) {
      this.subscribers.set(fn, []);
    } else {
      subs.push(cb);
    }
  }

  emit<T>(fn: () => void, payload: T): void {
    if (!fn) {
      return;
    }
    const subs = this.subscribers.get(fn);

    if (subs) {
      subs.forEach(
        (cb: (payload: T) => void): void => {
          cb(payload);
        },
      );
    }
  }

  removeSubscribers<T>(fn: FunctionParamType<T>, cb?: () => void): void {
    if (!fn) {
      return;
    }

    const subs = this.subscribers.get(fn);

    if (subs) {
      if (cb) {
        subs.forEach(
          (subsCb: () => void, index: number): void => {
            if (subsCb === cb) {
              subs.splice(index, 1);
            }
          },
        );
      } else {
        this.subscribers.delete(fn);
      }
    }
  }
}
