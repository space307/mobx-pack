// @flow

/**
 * BinderProvider creates new binder context and provide in to child components through react context
 */

import React from 'react';
import Binder from './Binder.js';
import type { GlobalContextType } from './typing/common';

type BinderProviderStateTypes = {
  error: ?string,
  ready: boolean,
};


export default function createBinderProvider(BinderContext: React$Context<GlobalContextType>, InitialState?: Class<*>):
  (Component: React$ComponentType<*>)=>React$ComponentType<*> {
  return function BinderProvider(Component: React$ComponentType<*>): React$ComponentType<*> {
    class ComponentWrapper<PropType> extends
      React.Component<{context:GlobalContextType, props:PropType}, BinderProviderStateTypes > {
      static contextType = BinderContext;

      state: BinderProviderStateTypes = {
        error: null,
        ready: true,
      };

      newContext:GlobalContextType;
      constructor(props, context) {
        super();

        this.newContext = new Binder(context && context.binder);

        if (!Component || typeof Component !== 'function') {
          this.state.error = 'BinderProvider wait for "React.Component" in attributes';
        }

        if (InitialState) {
          this.state.ready = false;
        }
      }

      componentWillUnmount(): void {
        if (this.newContext) {
          this.newContext.clear();
        }
      }
      componentDidMount(){
     /*   this.newContext.start().then(()=>{


        })*/
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

