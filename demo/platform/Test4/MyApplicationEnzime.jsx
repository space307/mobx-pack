/*  eslint-disable */
import React from 'react';
import { observer, Observer } from 'mobx-react';

import { GarageStore, TimeService, CarStore, initialState } from './Environment.js';
import { BinderContext, ServiceContext, GlobalContext } from './ComponentContext.js';
import { Provider, BinderProvider } from './Provider.jsx';
import { Binder } from 'sources.js';


import { onStop, onStart, unbindServices, bindServices, bindAs } from 'sources.js';


const storeName = 'test';
@bindAs(storeName)
class ServiceProto {
  count = 1;
  @onStart
  onStart() {
    return new Promise(
      (resolve) => {
        setTimeout(() => { resolve(); });
      },
    );
  }
}


const binder = new Binder();

const Component = ({ count }) => (<div id="count">!!{count}!!</div>);

const ComponentWithProvider = Provider(Component, {
  helper(service) {
    return {
      count: service.count,
    };
  },
  services: [ServiceProto],
});

export default ()=>(<BinderContext.Provider value={{ binder, initialState }}>
  <Component />
</BinderContext.Provider>);

