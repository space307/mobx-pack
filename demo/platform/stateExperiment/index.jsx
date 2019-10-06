// @flow
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { Observer } from 'mobx-react';
import StateContext from './StateContext.js';
import AppState from './state.js';
import { AssetService, Middleware, AccountService } from './services.js';
import type { IState } from './types.js';

const AccountSwitcher = ({ items, select }) => (<div>
  {items.map(item => (<button key={item.id} onClick={() => { select(item.id); }}>account - {item.id}</button>))}
</div>);


const AccountSwitcherContainer = () => (<StateContext.Consumer>{(state: IState) =>
  (<Observer>{() =>
    (<AccountSwitcher
      items={state.account.collection}
      select={(id) => {
        state.account.select(id);
      }}
    />)
  }
  </Observer>)
}</StateContext.Consumer>);

const AssetsSwitcher = ({ items, select }) => (<div>
  {items.map(item => (<button key={item.id} onClick={() => { select(item.id); }}>{item.id}</button>))}
</div>);

const AssetsSwitcherContainer = () => (<StateContext.Consumer>{(state: IState) =>
  (<Observer>{() =>
    (<AssetsSwitcher
      items={state.asset.collection}
      select={(id) => {
        state.asset.select(id);
      }}
    />)
  }
  </Observer>)
}</StateContext.Consumer>);


class Layout extends React.Component<*> {
  render() {
    return (<div>
      <h3>AccountSwitcher</h3>
      <AccountSwitcherContainer />
      <h3>Assets</h3>
      <AssetsSwitcherContainer />
    </div>);
  }
}


class Container extends React.Component<{services: Array<Class<*>>, children: React$Node}> {
  services = [];

  static contextType = StateContext;

  contextState;

  constructor(props, context) {
    super(props, context);

    this.contextState = context;

    props.services.forEach((Service) => {
      const service = new Service();

      this.services.push(service);
      if (typeof service.onStart === 'function') {
        service.onStart(context);
      }
      if (service.constructor.descriptor) {
        context[service.constructor.descriptor] = service;
      }
    });
  }

  componentWillUnmount(): void {
    this.services.forEach((service) => {
      if (typeof service.onStop === 'function') {
        service.onStop(this.contextState);
      }
      if (service.constructor.descriptor) {
        delete this.contextState[service.constructor.descriptor];
      }
    });
  }


  render() {
    return this.props.children;
  }
}


export default () => (<StateContext.Provider value={AppState}>

  <Container services={[AssetService, Middleware, AccountService]} >
    <Layout />
  </Container>

</StateContext.Provider>);
