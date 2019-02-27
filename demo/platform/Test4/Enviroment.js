// @flow
/* eslint-disable no-console */
import { observable } from 'mobx';
import type { ServiceConfigType } from 'sources.js';


const SERVICE_NAMES = {
  GARAGE_STORE: 'GARAGE_STORE',
  TIME_SERVICE: 'TIME_SERVICE',
  CAR_STORE: 'CAR_STORE',
};


/* -- TimeService --*/

interface TimeServiceInterface {
  +time: string;
}

export class TimeService implements TimeServiceInterface {
  @observable
  time: string = '';

  onStart(initialService: *): boolean {
    console.log(['onStart', SERVICE_NAMES.TIME_SERVICE, initialService]);

    setInterval((): void => {
      const date = new Date();
      this.time = `${date.getMinutes()}:${date.getSeconds()}`;
    }, 10000);

    return true;
  }
}

export const TimeServiceConfig: ServiceConfigType<*, Class<TimeServiceInterface>> = {
  onStart: 'onStart',
  proto: TimeService,
  config: {
    bindAs: SERVICE_NAMES.TIME_SERVICE,
  },
};
/* --/ TimeService --*/

/* -- GarageStore --*/
interface GarageStoreInterface {
  +counter: number;
  setCount(count: number): void;
}


export class GarageStore implements GarageStoreInterface {
  @observable
  counter: number = 0;

  constructor(color: string): void {
    console.log(['constructor', SERVICE_NAMES.GARAGE_STORE, color]);
  }

  onStart(initialService: *): boolean {
    console.log(['onStart', SERVICE_NAMES.GARAGE_STORE, initialService]);

    setInterval((): void => {
      this.counter += 1;
    }, 10000);

    return true;
  }

  setCount(count: number): void {
    this.counter = count;
  }

  onBind(): void {
    console.log(['onBind', SERVICE_NAMES.GARAGE_STORE]);
  }
}

export const GarageStoreConfig: ServiceConfigType<*, Class<GarageStoreInterface>> = {
  onStart: 'onStart',
  proto: GarageStore,
  config: {
    bindAs: SERVICE_NAMES.GARAGE_STORE,
  },
};
/* --/ GarageStore --*/


/* -- CarStore --*/
interface CarStoreInterface {
  +modelName: string;
  setModelName(modelName: string): void
}


export class CarStore implements CarStoreInterface {
  @observable
  modelName: string = 'Zapor';

  constructor(modelName: string) {
    this.setModelName(modelName);
  }


  onStart(initialService: *): boolean {
    console.log(['onStart', SERVICE_NAMES.CAR_STORE, initialService]);
    return true;
  }

  setModelName(modelName: string): void {
    this.modelName = modelName;
  }

  onBind(): void {
    console.log(['onBind', SERVICE_NAMES.CAR_STORE]);
  }
}

export const CarStoreConfig: ServiceConfigType<*, Class<CarStoreInterface>> = {
  onStart: 'onStart',
  proto: CarStore,
  config: {
    bindAs: SERVICE_NAMES.CAR_STORE,
    onBind: [[SERVICE_NAMES.GARAGE_STORE, SERVICE_NAMES.TIME_SERVICE, 'onBind']],
  },
};
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
