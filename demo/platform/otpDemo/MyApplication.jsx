// @flow
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { Observer } from 'mobx-react';
import { Binder } from 'sources.js';

import { InitialState, GarageStore, TimeService, CarStore } from './Environment.js';
import { BinderContext, ServiceContext } from './ComponentContext.js';
import { Provider, BinderProvider } from './Provider.jsx';
import type { ServiceInterfaces } from './typing/types.js';

type DriverPropType = {
  modelName: string,
  time: string,
}

class Driver extends React.PureComponent<DriverPropType> {
  render() {
    // console.log(['Driver render']);
    return (<div>Driver!!! modelName:{this.props.modelName} time: {this.props.time}
    </div>);
  }
}

const DriverContainer = () => (<ServiceContext.Consumer>{
  ({ carStore, timeService }: $Shape<ServiceInterfaces>) =>
    (<Observer>{() => (<Driver modelName={carStore.modelName} time={timeService.time} />)}</Observer>)
}</ServiceContext.Consumer>);


type CarPropType = {
  modelName: string,
  time: string,
}

class Car extends React.PureComponent<CarPropType> {
  render() {
    // console.log(['Car render']);
    const { modelName, time } = this.props;

    return (<div>
      <h1>Car</h1>
      <div>modelName: {modelName}</div>
      <div>time: {time}</div>
      <DriverContainer />
    </div>);
  }
}

const CarContainer = Provider(
  Car,
  {
    helper({ carStore, timeService }: $Shape<ServiceInterfaces>): CarPropType {
      return {
        modelName: carStore.modelName,
        time: timeService.time,
      };
    },
    services: props => [[CarStore, () => new CarStore(props.modelName)], TimeService],
    stop: true,
  },
);

type GarageStateType = {
  visible: boolean,
  cars: Array<string>,
}
type GaragePropType = {
  counter: number,
  color: number,
}

class Garage extends React.Component<GaragePropType, GarageStateType > {
    state={
      visible: false,
      cars: [],
    };

    addCar = () => {
      this.setState({ cars: this.state.cars.concat(['mercedes']) });
    };

  removeCar = () => {
    const cars = this.state.cars.slice();
    cars.pop();

    this.setState({ cars });
  };

  render() {
    // console.log(['Garage render']);

    const { counter, color } = this.props;

    return (<div>
      <h1>Garage</h1>
      <div>Counter: {counter}</div>
      <div>Color: {color}</div>
      {
        this.state.cars.map((modelName, index) => <CarContainer key={index} modelName={modelName} />)
      }
      <button onClick={this.addCar}>Add car</button>
      <button onClick={this.removeCar}>Remove Car</button>
    </div>);
  }
}


const GarageContainer = Provider(
  Garage,
  {
    helper({ garageStore }: $Shape<ServiceInterfaces>, { color }): GaragePropType {
      return {
        color,
        counter: garageStore.counter,
      };
    },
    services: [[GarageStore, () => new GarageStore()]],
  });


type MyApplicationStateType = {
  timer: number,
  color: string,
}
class MyApplication extends React.Component<{}, MyApplicationStateType> {
  state = {
    timer: 0,
    color: 'dark',
  };

  static contextType = BinderContext;

  componentDidMount() {
    setInterval(() => {
      this.setState({ timer: this.state.timer += 1 });
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


const WithNewBinder = BinderProvider(
  Provider(MyApplication2, { services: [InitialState] }),
);


export default () => (
  <BinderContext.Provider value={new Binder()}>
    <WithNewBinder />
  </BinderContext.Provider>);
