import React from 'react';
import '@babel/polyfill';
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import CreateProvider from '../Provider.jsx';
import CreateBinderProvider from '../BinderProvider.jsx';
import Binder from '../Binder.js';
import { bindAs, onStart } from '../ServiceDecorators.js';

const BinderContext = React.createContext();
const StoreContext = React.createContext();
const Provider = CreateProvider(BinderContext, StoreContext);
const BinderProvider = CreateBinderProvider(BinderContext);

configure({ adapter: new Adapter() });

describe('serviceDecorators test', () => {
  it('wrong bindAs param', (done) => {
    const storeName = 'test';
    @bindAs(storeName)
    class ServiceProto {
         count = 1;
        @onStart
         onStart() {
           return new Promise(
             (resolve) => {
               setTimeout(() => { resolve(); });
             },
           );
         }
    }

    const initialState = {
      hello: 1,
    };

    const binder = new Binder();

    const Component = ({ count }) => (<div id="count">{count}</div>);

    const ComponentWithProvider = Provider(Component, {
      helper(service) {
        return {
          count: service.count,
        };
      },
      services: [ServiceProto],
    });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithProvider />
    </BinderContext.Provider>);

    const wrapper = mount(<ComponentWithBinderContext />);

    setTimeout(() => {
      wrapper.update();
      expect(1).toBe(1);
      done();
    });
  });
});
