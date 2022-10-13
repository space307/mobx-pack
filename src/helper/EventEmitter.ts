import mitt, { type EventType } from 'mitt';

export class EventEmitter<T extends Record<EventType, unknown>> {
  emitter = mitt<T>();

  emit<K extends keyof T>(eventType: K, payload: T[K]): void {
    this.emitter.emit(eventType, payload);
  }

  subscribe<K extends keyof T>(eventType: K, cb: (payload: T[K]) => void) {
    this.emitter.on(eventType, cb);
  }

  clear() {
    this.emitter.all.clear();
  }
}
