// @flow
/* eslint-disable no-console */
import { observable } from 'mobx';
import { onStop, onStart, unbindServices, bindServices, bindAs } from 'sources.js';


const SERVICE_NAMES = {
  GARAGE_STORE: 'GARAGE_STORE',
  TIME_SERVICE: 'TIME_SERVICE',
  CAR_STORE: 'CAR_STORE',
};


/* -- TimeService --*/

interface TimeServiceInterface {
  +time: string;
}

@bindAs(SERVICE_NAMES.TIME_SERVICE)
class TimeService implements TimeServiceInterface {
  @observable
  time: string = '';

  @onStart
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
interface GarageStoreInterface {
  +counter: number;
  setCount(count: number): void;
}

@bindAs(SERVICE_NAMES.GARAGE_STORE)
class GarageStore implements GarageStoreInterface {
  @observable
  counter: number = 0;

  @onStart
  onStart(initialService: *): Promise<*> {
    console.log(['onStart', SERVICE_NAMES.GARAGE_STORE, initialService]);

    setInterval((): void => {
      this.counter += 1;
    }, 10000);

    return new Promise(
      (resolve) => {
        setTimeout(() => resolve(), 10000);
      },
    );
  }
  @onStop
  onStop() {
    console.log(['onStop', SERVICE_NAMES.GARAGE_STORE]);
  }

  @bindServices(SERVICE_NAMES.TIME_SERVICE)
  onBind(): void {
    console.log(['onBind', SERVICE_NAMES.GARAGE_STORE]);
  }

  @bindServices(SERVICE_NAMES.CAR_STORE)
  onBindCar(): void {
    console.log(['onBindCar!!!!', SERVICE_NAMES.GARAGE_STORE]);
  }

  @unbindServices(SERVICE_NAMES.CAR_STORE)
  onUnbindCar(): void {
    console.log(['onUnbindCar', SERVICE_NAMES.GARAGE_STORE]);
  }

  setCount(count: number): void {
    this.counter = count;
  }
}

/* --/ GarageStore --*/


/* -- CarStore --*/
interface CarStoreInterface {
  +modelName: string;
  setModelName(modelName: string): void
}

@bindAs(SERVICE_NAMES.CAR_STORE)
class CarStore implements CarStoreInterface {
  @observable
  modelName: string = 'Zapor';

  constructor(modelName: string) {
    if (modelName) {
      this.setModelName(modelName);
    }
  }

  @onStart
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

  @bindServices(SERVICE_NAMES.GARAGE_STORE, SERVICE_NAMES.TIME_SERVICE)
  onBind(): void {
    console.log(['onBind', SERVICE_NAMES.CAR_STORE]);
  }
}


export { CarStore, GarageStore, TimeService };


/* --/ CarStore --*/


/* -- InitialState --*/
interface InitialStateInterface {
  +vip: boolean;
  +abTest: boolean;
}

class InitialState implements InitialStateInterface {
  vip: boolean = false;
  abTest: boolean = true;
}


export const initialState: InitialStateInterface = new InitialState();
/* --/ InitialState --*/
