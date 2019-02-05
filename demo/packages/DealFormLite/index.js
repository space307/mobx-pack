/* eslint-disable */
import index from './content/DealFormLite.jsx';
import InApi from './api/in.js';
import Store from './content/store.js';
import DealFormLite from './content/DealFormLite.jsx';
import OutApi from './api/out.js';
import React from 'react';
import ApiMD from './middleware/ApiMD.js';
import busMD from './middleware/BusMD.js';



export { ApiMD, busMD };

export default function(middlewareClass) {

  const out = new OutApi(middlewareClass);
  const store = new Store(out);
  const api = new InApi(store);
  const component = React.createElement(DealFormLite, {store});

  return { api, component };
};
