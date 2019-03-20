export interface TimeServiceInterface {
  +time: string;
}

export interface GarageStoreInterface {
  +counter: number;
  setCount(count: number): void;
}

export interface CarStoreInterface {
  +modelName: string;
  setModelName(modelName: string): void
}

export interface InitialStateInterface {
  +vip: boolean;
  +abTest: boolean;
}

export type ServiceInterfaces = {
  carStore: CarStoreInterface,
  garageStore: GarageStoreInterface,
  timeService: TimeServiceInterface,
}
