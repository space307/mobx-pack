/**
 * BinderProvider creates new binder context and provide in to child components through react context
 */

import * as React from 'react';
import { useMemo, useEffect, useContext } from 'react';
import { Binder } from './Binder.js';

export function createBinderProvider(
  BinderContext: React.Context<Binder>,
): <PropType extends object>(
  Component: React.ComponentType<PropType>,
) => React.ComponentType<PropType> {
  return function BinderProvider(Component) {
    // eslint-disable-next-line react/prefer-exact-props
    return function ComponentWrapper(props) {
      const parentContext = useContext(BinderContext);
      const newContext = useMemo(() => new Binder(parentContext), [parentContext]);

      useEffect(
        () => () => {
          newContext.clear();
        },
        [newContext],
      );

      if (!Component || typeof Component !== 'function') {
        throw new Error('BinderProvider wait for "React.Component" in attributes');
      }

      return (
        <BinderContext.Provider value={newContext}>
          <Component {...props} />
        </BinderContext.Provider>
      );
    };
  };
}
