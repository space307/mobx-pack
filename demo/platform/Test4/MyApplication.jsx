/*  eslint-disable */
import React from 'react';
import {observer, Observer} from 'mobx-react';

import { TestStoreConfig, TestServiceConfig } from './Enviroment.js';
import { BinderContext, StoreContext, GlobalContext } from './ComponentContext.js';
import Provider from './Provider.jsx'


class Engine extends React.PureComponent {
  render() {
    console.log(['Engine render', this.props.timer]);
    return (<div>Engine!!!</div>);
  }
}



const EngineConnector = Provider(
  Engine,
  {
    helper([store]){

      return { }

    },
    services: [TestStoreConfig]
  }

);



/*
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



class Car extends React.Component {

    state={
      visible: false
    };

    toggle = ()=>{
      this.setState({visible: !this.state.visible});
    };

    render() {
    console.log(['Car render', this.props.timer, this.props.theme]);
    return <div>Timer {this.props.timer} secs. Theme: {this.props.theme}
      {
        this.state.visible ?
          <EngineConnector />
          : null
      }

   {/* <DriverContainer theme={this.props.theme} />*/}

      <button onClick={this.toggle}>Toggle</button>
    </div>
  }
}



const Garage = Provider(
  Car,
  {
    helper([store, testService], {theme}){

      return {
        theme,
        timer: store.timer
      }

    },
  services: [TestStoreConfig, TestServiceConfig]
});






class MyApplication extends React.Component {

  state = {
    timer: 0,
    theme: 'dark',
  };

  componentDidMount() {
    setInterval(()=>{
      this.setState({timer: this.state.timer += 1});
    }, 1000);


    setTimeout(()=>{
      this.setState({theme: 'light'});
    }, 3000);



  }

  render() {

    console.log(['MyApplication render']);
    return (
      <div>
      <h1>My Application </h1>
      <BinderContext.Provider value={GlobalContext}>
        <Garage theme={this.state.theme} />
      </BinderContext.Provider>
    </div>
    );
  }
}

export default MyApplication;
