// @flow

import React from 'react';
import { Binder } from 'sources.js';
import type { GlobalContextType } from './typing/common';


export default function CreateBinderProvider(BinderContext: React$Context<GlobalContextType>) {
  return function BinderProvider(Component: React$ComponentType<*>, initialState: *): React$ComponentType<*> {
    class ComponentWrapper<PropType> extends
      React.Component<{context:GlobalContextType, props:PropType} > {
      newContext:GlobalContextType;
      constructor({ context }) {
        super();
        this.newContext = {
          binder: new Binder(context && context.binder),
          initialState,
        };
      }
      render() {
        return (<BinderContext.Provider value={this.newContext}>
          <Component {...this.props.props} />
        </BinderContext.Provider>);
      }
    }

    return <Props>(props: Props) => (
      <BinderContext.Consumer>
        {context => <ComponentWrapper context={context} props={props} /> }
      </BinderContext.Consumer>
    );
  };
}

