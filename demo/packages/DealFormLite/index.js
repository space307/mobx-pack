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

export default function(Middleware, bus, id) {


  const context = {
    outApi: new OutApi(),
    inApi: new InApi(),
    store: new Store(),
    middleware: new Middleware(),
    bus,
    id,
  };

  context.outApi.start(context);
  context.inApi.start(context);
  context.store.start(context);
  context.middleware.start(context);


  const component = React.createElement(DealFormLite, {store: context.store});

  return { component };
};
