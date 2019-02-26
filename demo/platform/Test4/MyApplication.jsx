/*  eslint-disable */
import React from 'react';




const GlobalContext = {binder: {hello:1}, initialState: {buy:1}};

export const BinderContext: React$Context<?*> = React.createContext();
export const StoreContext: React$Context<?Array<*>> = React.createContext();




class Garage extends React.Component {

  static contextType = BinderContext;

  componentDidMount(): void {

    console.log(['componentDidMount', this.context]);
  }

  render() {
    return <div>Garage</div>;
  }
}


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
