// @flow

/**
 * BinderProvider creates new binder context and provide in to child components through react context
 */

import React from 'react';
import Binder from './Binder.js';
import type { GlobalContextType } from './typing/common';

export default function CreateBinderProvider(BinderContext: React$Context<GlobalContextType>) {
  return function BinderProvider(Component: React$ComponentType<*>, initialState?: *): React$ComponentType<*> {
    class ComponentWrapper<PropType> extends
      React.Component<{context:GlobalContextType, props:PropType} > {
      static contextType = BinderContext;

      newContext:GlobalContextType;
      constructor(props, context) {
        super();
        const contextInitialState = context && context.initialState;
        this.newContext = {
          binder: new Binder(context && context.binder),
          initialState: initialState || contextInitialState,
        };
      }
      render() {
        return (<BinderContext.Provider value={this.newContext}>
          <Component {...this.props.props} />
        </BinderContext.Provider>);
      }
    }

    return ComponentWrapper;
  };
}

