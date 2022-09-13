import * as React from 'react';
import { render } from '@testing-library/react';
import createBinderProvider from '../BinderProvider.js';
import Binder from '../Binder.js';

const BinderContext = React.createContext();
const BinderProvider = createBinderProvider(BinderContext);

describe('BinderProvider test', () => {
  it('create new binder with parent binder and put it to context', () => {
    const consumerMock = jest.fn();

    const binder = new Binder();

    function Component() {
      return (
        <div id="count">
          <BinderContext.Consumer>
            {(binderParam) => {
              consumerMock(!!(binderParam && binderParam.parentBinder === binder));
            }}
          </BinderContext.Consumer>
        </div>
      );
    }

    const ComponentWithBinderProvider = BinderProvider(Component);

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithBinderProvider />
        </BinderContext.Provider>
      );
    }

    render(<ComponentWithBinderContext />);
    expect(consumerMock).toHaveBeenCalledWith(true);
  });

  it('wrong attributes test', (done) => {
    const ComponentWithBinderProvider = BinderProvider();
    expect(() => {
      render(<ComponentWithBinderProvider />);
    }).toThrowError();
    done();
  });
});
