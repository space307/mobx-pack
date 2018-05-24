import React from 'react';
import Button from 'material-ui/Button';
import Input from 'material-ui/Input';
import inputStyle from 'demo/platform/style/input.json';

const DealBlock = ({ api, quantity, isRecharge }) => (
  <div>
    <label htmlFor="recharge_input">
      <div>
        <Input
          id="recharge_input"
          type="text"
          value={quantity}
          onChange={api.enterQuantity}
          style={inputStyle}
        />
      </div>
      <Button
        color="primary"
        variant="raised"
        onClick={api.buyAsset}
      >
        Buy
      </Button>
      <Button
        color="primary"
        variant="raised"
        onClick={api.sellAsset}
        style={{
          marginLeft: 10,
        }}
      >
        Sell
      </Button>
    </label>

    { isRecharge ?
      <div>
        <div>
          Not enough funds
          <Button
            color="primary"
            variant="raised"
            onClick={api.focusRecharge}
            style={{
              marginLeft: 10
            }}
          >
            Take more
          </Button>
        </div>
      </div>
      : null
    }
  </div>
);


export default DealBlock;

