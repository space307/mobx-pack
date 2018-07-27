import React from 'react';
import { Connector } from 'sources.js';
import context from 'demo/platform/helper/context.js';

import DealFormStore from 'demo/platform/containers/DealForm/store/DealFormStore.js';

import AssetSelector from 'demo/platform/containers/AssetSelector/index.jsx';
import DealBlock from 'demo/platform/containers/DealBlock/index.jsx';

import Divider from 'material-ui/Divider';
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import paperStyle from 'demo/platform/style/paperBlock.json';
import dibiderStyle from 'demo/platform/style/headerDivider.json';

//
const Form = () => (
  <Paper style={paperStyle}>
    <Typography variant="headline" component="h3">
      Form
    </Typography>
    <Divider style={dibiderStyle} />
    <AssetSelector />
    <DealBlock />
  </Paper>
);

export default Connector(
  Form,
  {
    store: () => new DealFormStore(context),
  },
);

