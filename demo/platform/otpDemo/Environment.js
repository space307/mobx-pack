// @flow
/* eslint-disable no-console */
import { observable } from 'mobx';
import { onStop, onStart, onUnbind, onBind, bindAs } from 'sources.js';
import type { CarStoreInterface, GarageStoreInterface,
  TimeServiceInterface, InitialStateInterface } from './typing/types.js';

const SERVICE_NAMES = {
  GARAGE_STORE: 'garageStore',
  TIME_SERVICE: 'timeService',
  CAR_STORE: 'carStore',
};

export const INITIAL_SERVICE = 'initialService';

/* -- TimeService --*/

@bindAs(SERVICE_NAMES.TIME_SERVICE)
class TimeService implements TimeServiceInterface {
  @observable
  time: string = '';

  @onStart(INITIAL_SERVICE)
  onStart(initialService: *): boolean {
    console.log(['onStart', SERVICE_NAMES.TIME_SERVICE, initialService]);

    setInterval((): void => {
      const date = new Date();
      this.time = `${date.getMinutes()}:${date.getSeconds()}`;
    }, 10000);

    return true;
  }
  @onStop
  onStop() {
    console.log(['onStop', SERVICE_NAMES.TIME_SERVICE]);
  }
}
/* --/ TimeService --*/

/* -- GarageStore --*/
@bindAs(SERVICE_NAMES.GARAGE_STORE)
class GarageStore implements GarageStoreInterface {
  @observable
  counter: number = 0;
  privateField: number = 0;

  @onStart(INITIAL_SERVICE)
  onStart(initialService: *): Promise<*> {
    console.log(['onStart', SERVICE_NAMES.GARAGE_STORE, initialService]);

    setInterval((): void => {
      this.counter += 1;
    }, 10000);

    return new Promise(
      (resolve) => {
        setTimeout(() => resolve(), 1000);
      },
    );
  }
  @onStop
  onStop() {
    console.log(['onStop', SERVICE_NAMES.GARAGE_STORE]);
  }

  @onBind(SERVICE_NAMES.TIME_SERVICE)
  onBind(): void {
    console.log(['onBind', SERVICE_NAMES.GARAGE_STORE]);
  }

  @onBind(SERVICE_NAMES.CAR_STORE)
  onBindCar(): void {
    console.log(['onBindCar!', SERVICE_NAMES.GARAGE_STORE]);
  }

  @onUnbind(SERVICE_NAMES.CAR_STORE)
  onUnbindCar(): void {
    console.log(['onUnbindCar', SERVICE_NAMES.GARAGE_STORE]);
  }

  setCount(count: number): void {
    this.counter = count;
  }
}

/* --/ GarageStore --*/


/* -- CarStore --*/
@bindAs(SERVICE_NAMES.CAR_STORE)
class CarStore implements CarStoreInterface {
  @observable
  modelName: string = 'Zapor';

  constructor(modelName: string) {
    if (modelName) {
      this.setModelName(modelName);
    }
  }

  @onStart(INITIAL_SERVICE)
  onStart(initialService: *): boolean {
    console.log(['onStart', SERVICE_NAMES.CAR_STORE, initialService]);
    return true;
  }

  @onStop
  onStop(): boolean {
    console.log(['onStop', SERVICE_NAMES.CAR_STORE]);
    return true;
  }
  setModelName(modelName: string): void {
    this.modelName = modelName;
  }

  @onBind(SERVICE_NAMES.GARAGE_STORE, SERVICE_NAMES.TIME_SERVICE)
  onBind(): void {
    console.log(['onBind', SERVICE_NAMES.CAR_STORE]);
  }
}
/* --/ CarStore --*/


/* -- InitialState --*/
@bindAs(INITIAL_SERVICE)
class InitialState implements InitialStateInterface {
  vip: boolean = false;
  abTest: boolean = true;
}
/* --/ InitialState --*/

export { CarStore, GarageStore, TimeService, InitialState };

