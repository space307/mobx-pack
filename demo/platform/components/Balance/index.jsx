import React from 'react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import paperStyle from 'demo/platform/style/paperBlock.json';
import dibiderStyle from 'demo/platform/style/headerDivider.json';

const Balance = ({
  api, balance, isRecharge, defaultAmount, bonusPercent,
}) => (
  <Paper style={paperStyle}>
    <Typography variant="headline" component="h3">
      Balance
    </Typography>
    <Divider style={dibiderStyle} />
    <div>
      <div><strong>Usd</strong> ${balance.usd}</div>
      <div><strong>Gold</strong> {balance.gold} oz.</div>
      <div><strong>Oil</strong> {balance.oil} bbl.</div>

      {
        isRecharge
          ?
          <Button
            color="primary"
            variant="raised"
            onClick={api.recharge}
          >
            Get ${defaultAmount} with {bonusPercent}% bonus
          </Button>
          : null
      }
      <Button
        color="primary"
        variant="raised"
        onClick={api.setDealFormAmount}
      >
        setDealFormAmount
      </Button>

    </div>
  </Paper>
);


export default Balance;

