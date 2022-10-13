/* eslint-disable react/no-multi-comp */
import * as React from 'react';
import { Observer } from 'mobx-react';
import { Binder } from 'mobx-pack';

import { InitialState, GarageStore, TimeService, CarStore } from './Environment';
import { BinderContext, ServiceContext } from './ComponentContext';
import { Provider, BinderProvider } from './Provider';
import type { ServiceInterfaces } from './typing/types';

type DriverPropType = {
  modelName: string;
  time: string;
};

class Driver extends React.PureComponent<DriverPropType> {
  render() {
    return (
      <div>
        Driver!!! modelName:{this.props.modelName} time: {this.props.time}
      </div>
    );
  }
}

function DriverContainer() {
  return (
    <ServiceContext.Consumer>
      {({ carStore, timeService }: any) => (
        <Observer>
          {() => <Driver modelName={carStore.modelName} time={timeService.time} />}
        </Observer>
      )}
    </ServiceContext.Consumer>
  );
}

type CarPropType = {
  modelName: string;
  time: string;
};

class Car extends React.PureComponent<CarPropType> {
  render() {
    // console.log(['Car render']);
    const { modelName, time } = this.props;

    return (
      <div>
        <h1>Car</h1>
        <div>modelName: {modelName}</div>
        <div>time: {time}</div>
        <DriverContainer />
      </div>
    );
  }
}

const CarContainer = Provider<
  { modelName: string },
  CarPropType,
  { carStore: CarStore; timeService: TimeService }
>(Car, {
  helper({ carStore, timeService }): CarPropType {
    return {
      modelName: carStore.modelName,
      time: timeService.time,
    };
  },
  services: props => [[CarStore, () => new CarStore(props.modelName)], TimeService],
  stop: true,
});

type GarageStateType = {
  cars: string[];
};
type GaragePropType = {
  counter: number;
  color: string;
};

class Garage extends React.Component<GaragePropType, GarageStateType> {
  state = {
    cars: [],
  };

  addCar = () => {
    this.setState(({ cars }) => ({ cars: cars.concat(['mercedes']) }));
  };

  removeCar = () => {
    this.setState(({ cars: prevCars }) => {
      const cars = prevCars.slice();
      cars.pop();
      return { cars };
    });
  };

  render() {
    const { counter, color } = this.props;

    return (
      <div>
        <h1>Garage</h1>
        <div>Counter: {counter}</div>
        <div>Color: {color}</div>
        {this.state.cars.map((modelName, index) => (
          <CarContainer key={index} modelName={modelName} />
        ))}
        <button type="button" onClick={this.addCar}>
          Add car
        </button>
        <button type="button" onClick={this.removeCar}>
          Remove Car
        </button>
      </div>
    );
  }
}

const GarageContainer = Provider<
  Pick<GaragePropType, 'color'>,
  Pick<GaragePropType, 'counter'>,
  ServiceInterfaces
>(Garage, {
  helper({ garageStore }, { color }) {
    return {
      color,
      counter: garageStore.counter,
    };
  },
  services: [[GarageStore, () => new GarageStore()]],
});

type MyApplicationStateType = {
  timer: number;
  color: string;
};

class MyApplication extends React.Component<{}, MyApplicationStateType> {
  state = {
    timer: 0,
    color: 'dark',
  };

  componentDidMount() {
    setInterval(() => {
      this.setState(({ timer }) => ({ timer: timer + 1 }));
    }, 1000);

    setTimeout(() => {
      this.setState({ color: 'light' });
    }, 3000);
  }

  render() {
    // console.log(['MyApplication']);
    return (
      <div>
        <h1>My Application </h1>
        <GarageContainer color={this.state.color} />
      </div>
    );
  }
}

const MyApplication2 = Provider(MyApplication, { services: [TimeService] });

const WithNewBinder = BinderProvider(Provider(MyApplication2, { services: [InitialState] }));

const binder = new Binder();

export function MyApplicationContainer() {
  return (
    <BinderContext.Provider value={binder}>
      <WithNewBinder />
    </BinderContext.Provider>
  );
}
