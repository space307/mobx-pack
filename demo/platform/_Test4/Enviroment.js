// @flow

import { observable } from 'mobx';
import type { ServiceConfigType } from 'sources.js';

const SERVICE_NAME = ' TestService';
const STORE_NAME = ' TestStore';

interface TestServiceInterface {
  +counter: number;
  setCount(count: number): void;
}

export class TestService implements TestServiceInterface {
  @observable
  counter: number = 0;

  onStart(initialService: *): boolean {
    console.log(['onStart', SERVICE_NAME, initialService]);

    setInterval((): void => {
      this.counter += 1;
    }, 1000);

    return true;
  }

  setCount(count: number): void {
    this.counter = count;
  }

  onBind(): void {
    console.log(['onBind', SERVICE_NAME]);
  }
}

export const TestServiceConfig: ServiceConfigType<*, Class<TestServiceInterface>> = {
  onStart: 'onStart',
  proto: TestService,
  config: {
    bindAs: SERVICE_NAME,
  },
};

interface TestStoreInterface {
  +timer: number;
  +timer2: number;
  setTimer(timer: number): void;
}

export class TestStore implements TestStoreInterface {
  @observable
  timer: number = 0;
  @observable
  timer2: number = 0;
  @observable
  abTest: boolean = false;

  testService: TestServiceInterface;

  constructor(a: number, b: number, c: number): void {
    console.log(['constructor', STORE_NAME, a, b, c]);
  }

  onStart(initialService: *): boolean {
    console.log(['onStart', STORE_NAME, initialService]);

    setInterval((): void => {
      this.timer++;
    }, 10000);

    setInterval((): void => {
      this.timer2++;
    }, 2000);

    return true;
  }

  onBind(testService: TestServiceInterface): void {
    this.testService = testService;
    console.log(['onBind', STORE_NAME, testService]);
  }

  setTimer(timer: number): void {
    this.timer = timer;
  }
}

export const TestStoreConfig: ServiceConfigType<*, Class<TestStoreInterface>> = {
  onStart: 'onStart',
  proto: TestStore,
  config: {
    bindAs: STORE_NAME,
    onBind: [[SERVICE_NAME, 'onBind']],
  },
};


interface InitialStateInterface {
  +vip: boolean;
  +abTest: boolean;
}

class InitialState implements InitialStateInterface {
  vip: boolean = false;
  abTest: boolean = true;
}


export const initialState: InitialStateInterface = new InitialState();
