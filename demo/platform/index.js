import React from 'react';
import ReactDOM from 'react-dom';

import priceService from 'demo/platform/services/PriceService/index.js';
import assetService from 'demo/platform/services/AssetService/index.js';
import baseService from 'demo/platform/services/BaseService/index.js';
import dealService from 'demo/platform/services/DealService/index.js';
import balanceService from 'demo/platform/services/BalanceService/index.js';
import Platform from 'demo/platform/layouts/Platform/index.jsx';


import outApi from 'demo/platform/api/out.js';
import inApi from 'demo/platform/api/in.js';
import BusMD from 'demo/platform/middleware/BusMD.js';
import bus from 'demo/packages/bus/bus.js';
import binderContext from 'demo/platform/helper/context.js';



const context = {
  outApi,
  inApi,
  bus,
  middleware: new BusMD(),
  binder: binderContext.binder,
};

context.outApi.start(context);
context.inApi.start(context);
context.middleware.start(context);

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    priceService.start('entry'),
    assetService.start('entry'),
    baseService.start('entry'),
    dealService.start('entry'),
    balanceService.start('entry'),
  ]).then(() => {
    ReactDOM.render(React.createElement(Platform), document.querySelector('#root'));
  });
});

