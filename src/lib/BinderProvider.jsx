// @flow

/**
 * BinderProvider creates new binder context and provide in to child components through react context
 */

import React from 'react';
import Binder from './Binder.js';
import type { GlobalContextType } from './typing/common';

type BinderProviderStateTypes = {
  error: ?string,
};


export default function CreateBinderProvider(BinderContext: React$Context<GlobalContextType>) {
  return function BinderProvider(Component: React$ComponentType<*>, initialState?: *): React$ComponentType<*> {
    class ComponentWrapper<PropType> extends
      React.Component<{context:GlobalContextType, props:PropType}, BinderProviderStateTypes > {
      static contextType = BinderContext;

      state: BinderProviderStateTypes = {
        error: null,
      };

      newContext:GlobalContextType;
      constructor(props, context) {
        super();
        const contextInitialState = context && context.initialState;
        this.newContext = {
          binder: new Binder(context && context.binder),
          initialState: initialState || contextInitialState,
        };

        if (!Component || typeof Component !== 'function') {
          this.state.error = 'BinderProvider wait for "React.Component" in attributes';
        }
      }
      render() {
        if (this.state.error) {
          throw new Error(this.state.error);
        }
        return (<BinderContext.Provider value={this.newContext}>
          <Component {...this.props} />
        </BinderContext.Provider>);
      }
    }

    return ComponentWrapper;
  };
}

