
import React from 'react';
import { Binder } from 'mobx-pack';
import { BinderContext } from './../ComponentContext.js';
import { BinderProvider } from './../Provider.jsx';

const initialStateInstance = {};

/*
BinderProvider - создаёт новый BinderContext
*/

const MyApplication = () => (
  <div>
    <BinderContext.Cunsumer>{({ binder, initialState }) => {
      console.log(binder, initialState);
    }}</BinderContext.Cunsumer>

  </div>
);

const Variant1 = BinderProvider(
  MyApplication,
  initialStateInstance,
);


const Variant2 = ({ props }) => (
  <BinderContext.Provider value={{ binder: new Binder(), initialState: initialStateInstance }}>
    <MyApplication {...props} />
  </BinderContext.Provider>);


export { Variant1, Variant2 };
