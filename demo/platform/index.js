
/*
Legacy demo page

import React from 'react';
import ReactDOM from 'react-dom';
import priceService from 'demo/platform/services/PriceService/index.js';
import assetService from 'demo/platform/services/AssetService/index.js';
import baseService from 'demo/platform/services/BaseService/index.js';
import dealService from 'demo/platform/services/DealService/index.js';
import balanceService from 'demo/platform/services/BalanceService/index.js';
import Platform from 'demo/platform/layouts/Platform/index.jsx';

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    priceService.start('entry'),
    assetService.start('entry'),
    baseService.start('entry'),
    dealService.start('entry'),
    balanceService.start('entry'),
  ]).then(() => {
    ReactDOM.render(React.createElement(MyApplication), document.querySelector('#root'));
  });
});
*/


// otp demo page
import React from 'react';
import ReactDOM from 'react-dom';
import MyApplication from 'demo/platform/otpDemo/MyApplication.jsx';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(React.createElement(MyApplication), document.querySelector('#root'));
});
