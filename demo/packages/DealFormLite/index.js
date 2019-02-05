/* eslint-disable */
import index from './content/DealFormLite.jsx';
import Api from './api/api.js';
import Store from './content/store.js';
import DealFormLite from './content/DealFormLite.jsx';
import OutApi from './api/out.js';
import React from 'react';
import PlatformApiMd from './middleware/platformApiMd.js';

//import Middleware from 'packages/DealFormLite/middleware/in.js';
//Middleware();


export { PlatformApiMd };

export default function(middlewareClass) {

  const out = new OutApi(middlewareClass);
  const store = new Store(out);
  const api = new Api(store);


  //(new MiddlewareClass({...middlewares, ...{dealFormLiteApi:api, dealFormLiteOutApi: out}})).start();



  //middleware();


  const component = React.createElement(DealFormLite, {store});

  return { api, component };
};
