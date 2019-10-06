import React from 'react';
import StateContext from './StateContext.js';
import state from './state.js';


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


export default () => (<StateContext.Provider value={state}>
  <Layout />
</StateContext.Provider>);
