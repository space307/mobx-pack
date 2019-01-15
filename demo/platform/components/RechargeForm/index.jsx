import React from 'react';
import { ASSET_NAMES } from 'demo/platform/constants/common.js';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import inputStyle from 'demo/platform/style/input.json';
import dibiderStyle from 'demo/platform/style/headerDivider.json';

class RechargeForm extends React.Component {
  static displayName = 'RechargeForm';

  constructor(props) {
    super();

    this.state = {
      amount: props.amount,
    };

    this.input = null;

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.amount !== this.props.amount) {
      this.setState({ amount: nextProps.amount });
    }
    // TODO починить фокус
/*    if (nextProps.inFocus !== this.props.inFocus && !!nextProps.inFocus) {
      setTimeout(() => {
        this.input.focus();
        this.input.select();
      });
    }*/
  }
  onChange(e) {
    this.setState({ amount: e.currentTarget.value });
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.api.recharge(Number(this.state.amount));
  }

  render() {
    return (
      <form>
        <Typography variant="headline" component="h3">
          Fund
        </Typography>
        <Divider style={dibiderStyle} />
        <div>
          <Input
            ref={(node) => {
              this.input = node; }}
            type="text"
            value={this.state.amount}
            onChange={this.onChange}
            style={inputStyle}
          />
          {ASSET_NAMES.USD}
        </div>
        <div>+ ${this.props.bonusPercent} bonus</div>
        <div>
          <Button
            color="primary"
            variant="raised"
            style={{
              marginTop: 15,
            }}
            onClick={this.onSubmit}
          >
            Fund
          </Button>
        </div>
      </form>
    );
  }
}

export default RechargeForm;

