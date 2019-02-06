/* eslint-disable */
import React from 'react';
import { observer } from 'mobx-react';

class DealFormLite extends React.Component<*> {
  render() {
    return (<div style={{background:'#000', color: '#fff'}}>
      <h1>DealFormLite</h1>
      <div style={{background:'#000'}}><strong>balance</strong>: {this.props.balance}</div>
      <div style={{background:'#000'}}><strong>price</strong>: {this.props.price}</div>
      <div style={{background:'#000'}}><strong>asset</strong>: {this.props.asset}</div>
      <div style={{background:'#000'}}><strong>amount</strong>: {this.props.amount}</div>
      <button onClick={()=>{
        this.props.updateBalance();
      }}>Update balance</button>

      <button onClick={()=>{
        this.props.selectAsset();
      }}>Select gold asset</button>


    </div>);
  }
}
@observer
class DealFormLiteWrapper extends React.Component<*> {
  render() {
    return <DealFormLite
      price={this.props.store.price}
      asset={this.props.store.asset}
      amount={this.props.store.amount}
      balance={this.props.store.balance}
      updateBalance={()=>{
      this.props.store.updateBalance()
      }}
      selectAsset={()=>{
        this.props.store.selectAsset('gold')
      }}
    />;
  }
}

export default DealFormLiteWrapper;
