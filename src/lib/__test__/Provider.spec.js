import React from 'react';
import '@babel/polyfill';
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CreateProvider from '../Provider.jsx';
import Binder from '../Binder.js';
import { bindAs, onStart } from '../ServiceDecorators.js';
import { startService } from '../serviceUtils.js';

const BinderContext = React.createContext();
const StoreContext = React.createContext();
const Provider = CreateProvider(BinderContext, StoreContext);


configure({ adapter: new Adapter() });

describe('Provider test', () => {
  it('calls helper && start service normally && pass props to child', (done) => {
    const storeName = 'test';
    const countValue = 1;
    @bindAs(storeName)
    class ServiceProto {
         count = countValue;
        @onStart
         onStart() {
           return new Promise(
             (resolve) => {
               setTimeout(() => { resolve(); });
             },
           );
         }
    }

    const helperMock = jest.fn();
    const childPropsMock = jest.fn();

    const initialState = {};

    const binder = new Binder();

    const Component = ({ count, pass }) => {
      childPropsMock(count === countValue, pass);
      return (<div id="count">{count}</div>);
    };

    const ComponentWithProvider = Provider(Component, {
      helper(service, { pass }) {
        helperMock(binder.getStore(storeName) === service && pass);
        return {
          pass,
          count: service.count,
        };
      },
      services: [ServiceProto],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider pass />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();

      setTimeout(() => {
        expect(helperMock).toHaveBeenCalledWith(true);
        expect(childPropsMock).toHaveBeenCalledWith(true, true);
        expect(binder.isBind(storeName)).toBe(true);
        done();
      });
    });
  });

  it('start service with attributes in constructor', (done) => {
    const constructorMock = jest.fn();

    const attributeToConstructor = 3;
    const storeName = 'test';

    @bindAs(storeName)
    class ServiceProto {
      count = 1;
      constructor(count) {
        this.count = count;
        constructorMock(count);
      }
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};

    const binder = new Binder();

    const Component = ({ count }) => (<div id="count">{count}</div>);

    const ComponentWithProvider = Provider(Component, {
      services: ({ count }) => [[ServiceProto, [count]]],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider count={attributeToConstructor} />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();
      setTimeout(() => {
        expect(constructorMock).toHaveBeenCalledWith(attributeToConstructor);
        done();
      });
    });
  });

  it('put services to context', (done) => {
    const consumerMock = jest.fn();

    const storeName = 'test';

    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};

    const binder = new Binder();

    const Component = () => (<div id="count"><StoreContext.Consumer>{([store]) => {
      consumerMock(store === binder.getStore(storeName));
    }}</StoreContext.Consumer></div>);


    const ComponentWithProvider = Provider(Component, {
      services: ({ count }) => [[ServiceProto, [count]]],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();
      setTimeout(() => {
        expect(consumerMock).toHaveBeenCalledWith(true);
        done();
      });
    });
  });


  it('stop only started service', (done) => {
    const storeName = 'test';
    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const storeName2 = 'test2';
    @bindAs(storeName2)
    class ServiceProto2 {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};
    const binder = new Binder();

    const Component = () => (<div id="count" />);

    startService(binder, initialState, { proto: ServiceProto, binderConfig: ServiceProto.binderConfig }).then(() => {
      const ComponentWithProvider = Provider(Component, {
        services: [ServiceProto, ServiceProto2],
        stop: true,
      });

      const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
        <ComponentWithProvider color={1} />
      </BinderContext.Provider>);

      const wrapper = mount(<ComponentWithBinderContext />);

      setTimeout(() => {
        wrapper.update();

        setTimeout(() => {
          const serviceToStop = wrapper.find(ComponentWithProvider).instance().serviceToStop;
          expect(serviceToStop.length).toBe(1);
          expect(serviceToStop[0].proto === ServiceProto2).toBe(true);

          wrapper.unmount();

          expect(binder.isBind(storeName)).toBe(true);
          expect(binder.isBind(storeName2)).toBe(false);

          done();
        });
      });
    });
  });

  it('not stop if stop option is not defined', (done) => {
    const storeName = 'test';
    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};
    const binder = new Binder();
    const Component = () => (<div id="count" />);

    const ComponentWithProvider = Provider(Component, {
      services: [ServiceProto],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider color={1} />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();

      setTimeout(() => {
        wrapper.unmount();
        expect(binder.isBind(storeName)).toBe(true);
        done();
      });
    });
  });

  it('sub test', (done) => {
    const storeName = 'test';
    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve) => {
            setTimeout(() => { resolve(); });
          },
        );
      }
    }

    const initialState = {};
    const binder = new Binder();
    const Component = () => (<div id="count" />);

    const ComponentWithProvider = Provider(Component, {
      services: [ServiceProto],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider color={1} />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();

      setTimeout(() => {
        wrapper.unmount();
        expect(binder.isBind(storeName)).toBe(true);
        done();
      });
    });
  });


});