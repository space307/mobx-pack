import React from 'react';
import ReactDOM from 'react-dom';

import priceService from 'demo/platform/services/PriceService/index.js';
import assetService from 'demo/platform/services/AssetService/index.js';
import baseService from 'demo/platform/services/BaseService/index.js';
import dealService from 'demo/platform/services/DealService/index.js';
import balanceService from 'demo/platform/services/BalanceService/index.js';
import Platform from 'demo/platform/layouts/Platform/index.jsx';
// import MyApplication from 'demo/platform/_Test4/MyApplication.jsx';
//import MyApplication from 'demo/platform/Test4/MyApplication.jsx';
import BinderTest2 from 'demo/platform/Test4/BinderTest2.js';
/* import BinderTest from 'demo/platform/Test4/BinderTest.js'; */
import { isEmpty, each, cloneDeep } from 'lodash';




document.addEventListener('DOMContentLoaded', () => {
/*  Promise.all([
    priceService.start('entry'),
    assetService.start('entry'),
    baseService.start('entry'),
    dealService.start('entry'),
    balanceService.start('entry'),
  ]).then(() => {
    ReactDOM.render(React.createElement(Platform), document.querySelector('#root'));
  }); */

   ReactDOM.render(React.createElement(MyApplication), document.querySelector('#root'));

});


