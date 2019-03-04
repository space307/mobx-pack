/*  eslint-disable */
import React from 'react';
import { observer, Observer } from 'mobx-react';

import { GarageStore, TimeService, CarStore, initialState } from './Environment.js';
import { BinderContext, StoreContext, GlobalContext } from './ComponentContext.js';
import { Provider, BinderProvider } from './Provider.jsx';






/*

class Engine extends React.PureComponent {
  render() {
    console.log(['Engine render', this.props.timer]);
    return (<div>Engine!!!</div>);
  }
}


const EngineConnector = Provider(
  Engine,
  {
    helper([store]) {
      return { };
    },
    services: [TestStoreConfig],
  },

);

class Driver extends React.PureComponent {
  render() {
    console.log(['Driver render', this.props.timer]);
    return (<div>Driver!!! timer:{this.props.timer} theme: {this.props.theme}
    <Engine />
    </div>);
  }
}

const DriverContainer = ({theme})=>(<StoreContext.Consumer>{
  ([store])=>(<Observer>{()=>(<Driver theme={theme} timer={store.timer2}/>)}</Observer>)
}</StoreContext.Consumer>);
*/

class Car extends React.PureComponent {
  render() {
    const {modelName, time} = this.props;
    console.log(['Car render']);
    return (<div>
      <h1>Car</h1>
      <div>modelName: {modelName}</div>
      <div>time: {time}</div>
    </div>);
  }
}

/*
const CarContainer = BinderProvider(
  Provider(
    Car,
    {
      helper(carStore, timeService, props){
        //console.log(['CarContainer helper!!!!!!', carStore, timeService]);

        return {
          modelName: carStore.modelName,
          //time: timeService.time,
        }
      },
      services: (props)=>[[CarStore, [props.modelName]], TimeService]
    }
    ),
  initialState
);
*/

const CarContainer = Provider(
  Car,
  {
    helper(carStore, timeService, props){
      //console.log(['CarContainer helper!!!!!!', carStore, timeService]);

      return {
        modelName: carStore.modelName,
        //time: timeService.time,
      }
    },
    services: (props)=>[[CarStore, [props.modelName]], TimeService],
    stop: true
  }
);


  class Garage extends React.Component {
    state={
      visible: false,
      cars:[]
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
      const {counter, color} = this.props;
      //console.log(['Garage render', counter, color]);

      return (<div>
        <h1>Garage</h1>
        <div>Counter: {counter}</div>
        <div>Color: {color}</div>
        {
          this.state.cars.map((modelName, index)=><CarContainer key={index} modelName={modelName}/>)
        }
        <button onClick={this.addCar}>Add car</button>
        <button onClick={this.removeCar}>Remove Car</button>
      </div>);
    }
}


const GarageContainer = Provider(
  Garage,
  {
    helper(garageStore, { color }) {

      return {
        color,
        counter: garageStore.counter,
      };
    },
    services: props => [GarageStore],
  });




class MyApplication extends React.Component {
  state = {
    timer: 0,
    color: 'dark',
  };

  static contextType = BinderContext;

  componentDidMount() {
    setInterval(() => {
      this.setState({timer: this.state.timer += 1});
    }, 1000);

    setTimeout(() => {
      this.setState({ color: 'light' });
    }, 3000);
  }

  render() {
    console.log(['MyApplication', this.context]);

    return (
      <div>
        <h1>My Application </h1>
        <GarageContainer color={this.state.color} />
      </div>
    );
  }
}

export default BinderProvider(
  Provider(MyApplication, { services: [TimeService] }),
  initialState,
);