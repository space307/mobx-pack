import * as React from 'react';
import { useContext } from 'react';
import { render, act } from '@testing-library/react';
import type { ServicesHashType } from '../Provider';
import { createProvider } from '../Provider';
import { Binder } from '../Binder';
import { bindAs, onStart } from '../serviceDecorators';

const BinderContext = React.createContext<Binder>(new Binder());
const ServiceContext = React.createContext<ServicesHashType>({});
const Provider = createProvider(BinderContext, ServiceContext);

const delay = (ttl?: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ttl);
  });

describe('Provider test', () => {
  it('calls helper && start service normally & pass props to child & useState', async () => {
    const initialStateName = 'initialState';
    const serviceName = 'serviceProto';
    const countValue = 1;

    const onStartMock = jest.fn();

    const initialState = {};

    @bindAs(serviceName)
    class ServiceProto {
      count = countValue;

      @onStart(initialStateName)
      onStart(initialStateParam: any) {
        onStartMock(initialState === initialStateParam);
        return delay();
      }
    }

    const helperMock = jest.fn();
    const childPropsMock = jest.fn();

    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    function Component({ count, pass }: { count: number; pass: boolean }) {
      childPropsMock(count === countValue, pass);
      return <div id="count">{count}</div>;
    }

    const ComponentWithProvider = Provider<
      { pass: boolean },
      { count: number },
      { serviceProto: ServiceProto }
    >(Component, {
      helper({ serviceProto }: { serviceProto: ServiceProto }, { pass }) {
        helperMock(binder.getService(serviceName) === serviceProto && pass);
        return {
          count: serviceProto.count,
          pass,
        };
      },
      services: [ServiceProto],
    });

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithProvider pass />
        </BinderContext.Provider>
      );
    }

    render(<ComponentWithBinderContext />);

    await act(delay);

    expect(onStartMock).toHaveBeenCalledWith(true);
    expect(helperMock).toHaveBeenCalledWith(true);
    expect(childPropsMock).toHaveBeenCalledWith(true, true);
    expect(binder.isBind(serviceName)).toBe(true);
  });

  it('start service with attributes in constructor', async () => {
    const initialStateName = 'initialState';
    const constructorMock = jest.fn();

    const attributeToConstructor = 3;
    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {
      count = 1;

      constructor(count: number) {
        this.count = count;
        constructorMock(count);
      }

      @onStart(initialStateName)
      onStart() {
        return delay();
      }
    }

    const initialState = {};

    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    function Component({ count }: { count: number }) {
      return <div id="count">{count}</div>;
    }

    const ComponentWithProvider = Provider<{ count: number }, {}, { serviceProto: ServiceProto }>(
      Component,
      {
        services: ({ count }) => [[ServiceProto, [count]]],
      },
    );

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithProvider count={attributeToConstructor} />
        </BinderContext.Provider>
      );
    }

    await act(() => {
      render(<ComponentWithBinderContext />);
      return delay();
    });

    expect(constructorMock).toHaveBeenCalledWith(attributeToConstructor);
  });

  it('put services to context', async () => {
    const initialStateName = 'initialState';
    const consumerMock = jest.fn();

    const serviceName = 'serviceProto';

    @bindAs(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return delay();
      }
    }

    const initialState = {};

    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    function Component() {
      const { serviceProto } = useContext(ServiceContext);
      consumerMock(serviceProto === binder.getService(serviceName));
      return null;
    }

    const ComponentWithProvider = Provider<{}, {}, { serviceProto: ServiceProto }>(Component, {
      services: () => [ServiceProto],
    });

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithProvider />
        </BinderContext.Provider>
      );
    }

    render(<ComponentWithBinderContext />);

    await act(delay);

    expect(consumerMock).toHaveBeenCalledWith(true);
  });

  it('stop only started service', async () => {
    const initialStateName = 'initialState';
    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return delay();
      }
    }

    const serviceName2 = 'test2';

    @bindAs(serviceName2)
    class ServiceProto2 {
      @onStart(initialStateName)
      onStart() {
        return delay();
      }
    }

    const initialState = {};
    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    function Component() {
      return <div id="count" />;
    }

    await binder.start({
      proto: ServiceProto,
      protoAttrs: [],
      // @ts-expect-error decorator type issue
      binderConfig: ServiceProto.binderConfig,
    });
    const ComponentWithProvider = Provider<
      { color: number },
      {},
      { s1: ServiceProto; s2: ServiceProto2 }
    >(Component, {
      services: [ServiceProto, ServiceProto2],
      stop: true,
    });

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithProvider color={1} />
        </BinderContext.Provider>
      );
    }

    const wrapper = render(<ComponentWithBinderContext />);

    await act(delay);

    expect(binder.isBind(serviceName2)).toBe(true);

    wrapper.unmount();

    expect(binder.isBind(serviceName)).toBe(true);
    expect(binder.isBind(serviceName2)).toBe(false);
  });

  it('not stop if stop option is not defined', async () => {
    const initialStateName = 'initialState';
    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return delay();
      }
    }

    const initialState = {};
    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    function Component() {
      return <div id="count" />;
    }

    const ComponentWithProvider = Provider<{ color: number }, {}, { s1: ServiceProto }>(Component, {
      services: [ServiceProto],
    });

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithProvider color={1} />
        </BinderContext.Provider>
      );
    }

    const wrapper = render(<ComponentWithBinderContext />);

    await act(delay);

    wrapper.unmount();
    expect(binder.isBind(serviceName)).toBe(true);
  });

  it('stub test', async () => {
    const initialStateName = 'initialState';
    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return delay();
      }
    }

    const initialState = {};
    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    function Component() {
      return <div id="count" />;
    }

    function MyStub() {
      return <div id="stub">Loading...</div>;
    }

    const ComponentWithProvider = Provider<{ color: number }, {}, { s1: ServiceProto }>(Component, {
      services: [ServiceProto],
      stub: MyStub,
    });

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithProvider color={1} />
        </BinderContext.Provider>
      );
    }

    const wrapper = render(<ComponentWithBinderContext />);
    expect(wrapper.queryByText('Loading...')).toBeDefined();
    await act(delay);
    expect(wrapper.queryByText('Loading...')).toBeNull();
  });

  it('in helper do not return an object shows stub', async () => {
    const initialStateName = 'initialState';
    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return true;
      }
    }

    const initialState = {};
    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    function Component() {
      return <div id="count" />;
    }

    function MyStub() {
      return <div id="stub">Loading...</div>;
    }

    const ComponentWithProvider = Provider<{ color: number }, {}, { s1: ServiceProto }>(Component, {
      helper() {
        return undefined;
      },
      services: [ServiceProto],
      stub: MyStub,
    });

    function ComponentWithBinderContext() {
      return (
        <BinderContext.Provider value={binder}>
          <ComponentWithProvider color={1} />
        </BinderContext.Provider>
      );
    }

    const wrapper = render(<ComponentWithBinderContext />);
    expect(wrapper.queryByText('Loading...')).toBeDefined();
    await act(delay);
    expect(wrapper.queryByText('Loading...')).toBeDefined();
  });

  it('wrong attributes: no Component passed', () => {
    // @ts-expect-error Expected
    const ComponentWithProvider = Provider();
    expect(() => {
      render(<ComponentWithProvider />);
    }).toThrowError();
  });

  it('wrong attributes: wrong services', () => {
    const serviceName = 'test';

    @bindAs(serviceName)
    class ServiceProto {}

    const ComponentWithProvider = Provider(() => <div />, {
      // @ts-expect-error Expected
      services: [2],
    });
    expect(() => {
      render(<ComponentWithProvider />);
    }).toThrowError('Object passed as ServiceItem to Provider is not a constructor (component: )');

    const ComponentWithProvider2 = Provider(() => <div />, {
      services: [[ServiceProto]],
    });
    expect(() => {
      render(<ComponentWithProvider2 />);
    }).toThrowError('ServiceItem passed in Provider is not valid Array (component: )');

    const ComponentWithProvider3 = Provider(() => <div />, {
      // @ts-expect-error Expected
      services: [ServiceProto, {}],
    });
    expect(() => {
      render(<ComponentWithProvider3 />);
    }).toThrowError('Object passed as ServiceItem to Provider is not a constructor (component: )');
  });

  it('pass props through provider without helper', () => {
    function Component(props: any) {
      return <div data-testid="inner" {...props} />;
    }

    const ComponentWithProvider = Provider(Component);
    const wrapper = render(
      // @ts-expect-error Expected
      <BinderContext.Provider value={{}}>
        <ComponentWithProvider data-myvalue="1" />
      </BinderContext.Provider>,
    );
    expect(wrapper.queryByTestId('inner')?.dataset.myvalue).toBe('1');
  });
});
