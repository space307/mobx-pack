/* eslint-disable */
import React from 'react';
import { observer } from 'mobx-react';

class DealFormLite extends React.Component<*> {
  render() {
    return (<button style={{background:'#000', color: '#fff'}}>
      <h1>DealFormLite</h1>
      <div style={{background:'#000'}}><strong>rate</strong>: {this.props.rate}</div>
      <div style={{background:'#000'}}><strong>pair</strong>: {this.props.pair}</div>
      <button onClick={()=>{

      }}><strong>pair</strong>: {this.props.pair}</button>
    </div>);
  }
}
@observer
class DealFormLiteWrapper extends React.Component<*> {
  render() {
    return <DealFormLite rate={this.props.store.rate} pair={this.props.store.pair}/>;
  }
}

export default DealFormLiteWrapper;
