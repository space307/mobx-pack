import { useContext } from 'react';
import * as React from 'react';
import { screen, render } from '@testing-library/react';
import { createBinderProvider } from '../BinderProvider';
import { Binder } from '../Binder';

const BinderContext = React.createContext(new Binder());
const BinderProvider = createBinderProvider(BinderContext);

class ErrorBoundary extends React.Component<React.PropsWithChildren, { error: string | null }> {
  static getDerivedStateFromError(err: Error) {
    return { error: err.message };
  }

  state = {
    error: null,
  };

  render() {
    if (this.state.error) {
      return <p data-testid="error">{this.state.error}</p>;
    }

    return this.props.children;
  }
}

describe('BinderProvider test', () => {
  it('create new binder with parent binder and put it to context', () => {
    const consumerMock = jest.fn();

    const binder = new Binder();

    function Component() {
      const localBinder = useContext(BinderContext);
      consumerMock(!!(localBinder && localBinder.parentBinder === binder));
      return null;
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

  it('wrong attributes test', () => {
    // @ts-expect-error Expected
    const ComponentWithBinderProvider = BinderProvider();

    render(
      <ErrorBoundary>
        <ComponentWithBinderProvider />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('error')).toBeDefined();
  });
});
