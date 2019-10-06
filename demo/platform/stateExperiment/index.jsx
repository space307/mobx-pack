import React, { Fragment } from 'react';
import StateContext from './StateContext.js';
import state from './state.js';
import { AssetService, AssetMD, AccountService } from './services.js';

const AccountSwitcher = () => (<div>
  AccountSwitcher
</div>);

const AssetsSwitcher = () => (<div>
  AssetsSwitcher
</div>);


class Layout extends React.Component {
  render() {
    return (<div>
      <h3>AccountSwitcher</h3>
      <AccountSwitcher />
      <h3>Assets</h3>
      <AssetsSwitcher />
    </div>);
  }
}


class Container extends React.Component {
  state = {
    ready: false,
  };

  services = [];

  static contextType = StateContext;

  constructor(props, context) {
    super();

    props.services.forEach((Service) => {
      const service = new Service();

      this.services.push(service);
      if (typeof service.onStart === 'function') {
        service.onStart(context);
      }
    });
  }

  componentWillUnmount(): void {
    this.props.services.forEach((Service) => {
      const service = new Service();

      this.services.push(service);
      if (typeof service.onStop === 'function') {
        // service.onStop(context);
      }
    });
  }


  render() {
    return <Fragment>{this.props.children} </Fragment>;
    // return <Fragment>{this.state.ready ? this.props.children : null} </Fragment>;
  }
}


export default () => (<StateContext.Provider value={state}>

  <Container services={[AssetService, AssetMD, AccountService]} >
    <Layout />
  </Container>

</StateContext.Provider>);
