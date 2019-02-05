/* eslint-disable */
import React from 'react';
import { observer } from 'mobx-react';

class DealFormLite extends React.Component<*> {
  render() {
    return (<div style={{background:'#000', color: '#fff'}}>
      <h1>DealFormLite</h1>
      <div style={{background:'#000'}}><strong>price</strong>: {this.props.price}</div>
      <div style={{background:'#000'}}><strong>asset</strong>: {this.props.asset}</div>
      <div style={{background:'#000'}}><strong>amount</strong>: {this.props.amount}</div>
      <button onClick={()=>{
        this.props.updateAsset();
      }}>updateAsset</button>

      <button onClick={()=>{
        this.props.selectAsset();
      }}>selectAsset</button>
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
      updateAsset={()=>{
      this.props.store.getAsset()
      }}
      selectAsset={()=>{
        this.props.store.selectAsset('gold')
      }}
    />;
  }
}

export default DealFormLiteWrapper;
