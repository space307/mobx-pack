/* eslint-disable no-unused-vars */
import { onStop, onStart, unbindServices, bindServices, bindAs } from 'sources.js';

const SERVICE_NAMES = {
  GARAGE_STORE: 'GarageStore',
  TIME_SERVICE: 'TimeService',
  CAR_STORE: 'CarStore',
  SOME_SERVICE: 'SomeService',
};

/* TimeService */
@bindAs(SERVICE_NAMES.TIME_SERVICE)
class TimeService {
  @onStart
  onStart(initialState) {}
}

/* CarStore */
@bindAs(SERVICE_NAMES.CAR_STORE)
class CarStore {
  @onStart
  onStart(initialState) {}

  @bindServices([SERVICE_NAMES.TIME_SERVICE, SERVICE_NAMES.GARAGE_STORE])
  onBind(timeService, garageStore) {}

  @bindServices([SERVICE_NAMES.GARAGE_STORE])
  onBindOnlyGarageStore(garageStore) {}

  @unbindServices([SERVICE_NAMES.TIME_SERVICE, SERVICE_NAMES.GARAGE_STORE])
  onUnbind() {}

  @onStop
  onStop() {}
}

/* GarageStore */
@bindAs(SERVICE_NAMES.GARAGE_STORE)
class GarageStore {
  @onStart
  onStart(initialState) {}

  @bindServices([SERVICE_NAMES.TIME_SERVICE])
  onBind(timeService) {

  }
  @unbindServices([SERVICE_NAMES.TIME_SERVICE])
  onUnbind() {}

  @onStop
  onStop() {}
}

/* Альтернатива */

/* SomeService */
class SomeService {
  static binderConfig = {
    bindAs: SERVICE_NAMES.SOME_SERVICE,
    onBind: [
      [SERVICE_NAMES.TIME_SERVICE, 'onBind'],
    ],
  };
  onStart(initialState) {}
  onBind(timeService) {}
}

export { GarageStore, TimeService, CarStore, SomeService };
