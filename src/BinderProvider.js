// @flow

/**
 * BinderProvider creates new binder context and provide in to child components through react context
 */

import * as React from 'react';
import { useContext, useMemo, useEffect } from 'react';
import Binder from './Binder.js';
import type { GlobalContextType } from './typing/common';

export default function createBinderProvider(BinderContext: React$Context<GlobalContextType>):
  (Component: React$ComponentType<*>)=>React$ComponentType<*> {
  return function BinderProvider(Component: React$ComponentType<*>): React$ComponentType<*> {
    // eslint-disable-next-line react/prefer-exact-props
    return function ComponentWrapper<PropType>(props: { context: GlobalContextType, props: PropType }) {
      const binder = useContext(BinderContext);
      const newContext = useMemo(() => new Binder(binder), [binder]);

      useEffect(() => () => {
        newContext.clear();
      }, [newContext]);

      const error = !Component || typeof Component !== 'function'
        ? 'BinderProvider wait for "React.Component" in attributes'
        : null;

      if (error) {
        throw error;
      }

      return (
        <BinderContext.Provider value={newContext}>
          <Component {...props} />
        </BinderContext.Provider>
      );
    };
  };
}
