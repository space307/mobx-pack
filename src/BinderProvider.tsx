/**
 * BinderProvider creates new binder context and provide in to child components through react context
 */

import * as React from 'react';
import { useMemo, useEffect } from 'react';
import { Binder } from './Binder.js';

export function createBinderProvider(BinderContext: React.Context<Binder>): <
  PropType extends object,
>(
  Component: React.ComponentType<PropType>,
) => React.ComponentType<{
  context: Binder;
  props: PropType;
}> {
  return function BinderProvider(Component) {
    // eslint-disable-next-line react/prefer-exact-props
    return function ComponentWrapper(props) {
      const newContext = useMemo(() => new Binder(props.context), [props.context]);

      useEffect(
        () => () => {
          newContext.clear();
        },
        [newContext],
      );

      const error =
        !Component || typeof Component !== 'function'
          ? 'BinderProvider wait for "React.Component" in attributes'
          : null;

      if (error) {
        throw error;
      }

      return (
        <BinderContext.Provider value={newContext}>
          <Component {...props.props} />
        </BinderContext.Provider>
      );
    };
  };
}
