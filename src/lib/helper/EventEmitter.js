// @flow

import Events from 'events';

export default class EventEmitter {
  emitter: Events = new Events();

  emit(eventType: string, payload: *): void {
    this.emitter.emit(eventType, payload);
  }

  subscribe(eventType: string, cb: ()=>void) {
    this.emitter.on(eventType, cb);
  }

  removeAllListeners() {
    this.emitter.removeAllListeners();
  }
  removeListener(eventName: string, listener: ()=>void) {
    this.emitter.removeListener(eventName, listener);
  }
}
