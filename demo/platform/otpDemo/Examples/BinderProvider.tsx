import React from 'react';
import { Binder } from 'mobx-pack';
import { BinderContext } from '../ComponentContext';
import { BinderProvider } from '../Provider';

/*
 BinderProvider - создаёт новый BinderContext
 */

function MyApplication() {
  return (
    <div>
      <BinderContext.Consumer>
        {binder => {
          console.log(binder);
          return null;
        }}
      </BinderContext.Consumer>
    </div>
  );
}

const Variant1 = BinderProvider(MyApplication);

const binder = new Binder();

function Variant2({ props }: any) {
  return (
    <BinderContext.Provider value={binder}>
      <MyApplication {...props} />
    </BinderContext.Provider>
  );
}

export { Variant1, Variant2 };
