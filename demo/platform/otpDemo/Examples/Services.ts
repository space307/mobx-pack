/* eslint-disable no-unused-vars,@typescript-eslint/no-empty-function */
import { onStop, onStart, onUnbind, onBind, bindAs } from 'mobx-pack';

const SERVICE_NAMES = {
  GARAGE_STORE: 'GarageStore',
  TIME_SERVICE: 'TimeService',
  CAR_STORE: 'CarStore',
  SOME_SERVICE: 'SomeService',
};

/* TimeService */
@bindAs(SERVICE_NAMES.TIME_SERVICE)
class TimeService {
  @onStart()
  onStart() {}
}

/* CarStore */
@bindAs(SERVICE_NAMES.CAR_STORE)
class CarStore {
  @onStart()
  onStart() {}

  @onBind(SERVICE_NAMES.TIME_SERVICE, SERVICE_NAMES.GARAGE_STORE)
  onBind(_timeService: TimeService, _garageStore: GarageStore) {}

  @onBind(SERVICE_NAMES.GARAGE_STORE)
  onBindOnlyGarageStore(_garageStore: GarageStore) {}

  @onUnbind(SERVICE_NAMES.TIME_SERVICE, SERVICE_NAMES.GARAGE_STORE)
  onUnbind() {}

  @onStop
  onStop() {}
}

/* GarageStore */
@bindAs(SERVICE_NAMES.GARAGE_STORE)
class GarageStore {
  @onStart()
  onStart() {}

  @onBind(SERVICE_NAMES.TIME_SERVICE)
  onBind(_timeService: TimeService) {}

  @onUnbind(SERVICE_NAMES.TIME_SERVICE)
  onUnbind() {}

  @onStop
  onStop() {}
}

/* Альтернатива */

/* SomeService */
class SomeService {
  static binderConfig = {
    bindAs: SERVICE_NAMES.SOME_SERVICE,
    onBind: [[SERVICE_NAMES.TIME_SERVICE, 'onBind']],
  };

  onStart() {}

  onBind() {}
}

export { GarageStore, TimeService, CarStore, SomeService };
