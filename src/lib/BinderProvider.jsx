// @flow

import React from 'react';
import { Binder } from 'sources.js';
import type { GlobalContextType } from './typing/common';


export default function CreateBinderProvider(BinderContext: React$Context<GlobalContextType>) {
  return function BinderProvider(Component: React$ComponentType<*>, initialState: *): React$ComponentType<*> {
    return class BinderProviderComponent<PropType> extends React.Component<PropType> {
      static contextType = BinderContext;

      newContext:GlobalContextType;

      constructor() {
        super();
        this.newContext = {
          binder: new Binder(this.context && this.context.binder && this.context.binder.emitter),
          initialState,
        };
      }


      render() {
        return (<BinderContext.Provider value={this.newContext}>
          <Component {...this.props} />
        </BinderContext.Provider>);
      }
    };
  };
}

