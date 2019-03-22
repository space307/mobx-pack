import React from 'react';
import '@babel/polyfill';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import createBinderProvider from '../BinderProvider.js';
import Binder from '../Binder.js';

const BinderContext = React.createContext();
const BinderProvider = createBinderProvider(BinderContext);

configure({ adapter: new Adapter() });

describe('BinderProvider test', () => {
  it('create new binder with parent binder and put it to context', (done) => {
    const consumerMock = jest.fn();
    const initialState = {};

    const binder = new Binder();

    const Component = () => (<div id="count"><BinderContext.Consumer>
      {({ binder: binderParam, initialState: initialStateParam }) => {
        consumerMock(!!(binderParam && binderParam.parentBinder === binder && initialStateParam === initialState));
      }}</BinderContext.Consumer></div>);


    const ComponentWithBinderProvider = BinderProvider(Component);

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithBinderProvider />
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

  it('create new binder with pass new initialState', (done) => {
    const consumerMock = jest.fn();
    const initialState = {};

    const binder = new Binder();

    const Component = () => (<div id="count"><BinderContext.Consumer>
      {({ binder: binderParam, initialState: initialStateParam }) => {
        consumerMock(!!(binderParam && binderParam.parentBinder === binder && initialStateParam.test === 1));
      }}</BinderContext.Consumer></div>);


    const ComponentWithBinderProvider = BinderProvider(Component, { test: 1 });

    const ComponentWithBinderContext = () => (<BinderContext.Provider value={{ binder, initialState }}>
      <ComponentWithBinderProvider />
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


  it('wrong attributes test', (done) => {
    const ComponentWithBinderProvider = BinderProvider();
    expect(() => { shallow(<ComponentWithBinderProvider />); }).toThrowError();
    done();
  });

  it('pass props through provider', () => {
    const Component = () => (<div id="count" />);
    const ComponentWithBinderProvider = BinderProvider(Component, { test: 1 });
    const wrapper = mount(<ComponentWithBinderProvider test={1} />);
    expect(wrapper.find(Component).props().test).toBe(1);
  });
});
