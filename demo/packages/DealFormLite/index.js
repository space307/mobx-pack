/* eslint-disable */
import index from './content/DealFormLite.jsx';
import Api from './api/api.js';
import Store from './content/store.js';
import DealFormLite from './content/DealFormLite.jsx';
import React from 'react';
//import Middleware from 'packages/DealFormLite/middleware/in.js';
//Middleware();


export { index };

export default function(id, bus) {

  const store = new Store();
  const api = new Api(store);
  const component = React.createElement(DealFormLite, {store});

  return { api, component };
};
