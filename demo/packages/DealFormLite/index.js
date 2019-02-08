import React from 'react';
import Api from './gateway/api.js';
import Store from './content/store.js';
import DealFormLite from './content/DealFormLite.jsx';
import busMD from './gateway/BusMD.js';


export { busMD };

export default function (Middleware, bus, id) {
  const context = {
    api: new Api(),
    store: new Store(),
    middleware: new Middleware(),
    bus,
    id,
  };

  context.api.start(context);
  context.store.start(context);
  context.middleware.start(context);


  const component = React.createElement(DealFormLite, { store: context.store });

  return { component };
}
