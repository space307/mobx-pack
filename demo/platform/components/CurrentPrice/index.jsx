import React from 'react';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import paperStyle from 'demo/platform/style/paperBlock.json';
import dibiderStyle from 'demo/platform/style/headerDivider.json';

const CurrentPrice = ({ asset, bid, ask }) => (
  <Paper style={paperStyle}>
    <Typography variant="headline" component="h3">
      Current price
    </Typography>
    <Divider style={dibiderStyle} />
    <div><strong>Asset Id:</strong> {asset}</div>
    <div><strong>Bid price:</strong> {bid}</div>
    <div><strong>Ask price:</strong> {ask}</div>
  </Paper>
);

export default CurrentPrice;

