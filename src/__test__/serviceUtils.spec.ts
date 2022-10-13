import '@babel/polyfill';
import { startServices, stopServices } from '../serviceUtils';
import { Binder } from '../Binder';
import { onStart, bindAs, onStop } from '../serviceDecorators';
import { getConfig } from './utils.js';

describe('serviceUtils test', () => {
  it('startServices', done => {
    const initialStateName = 'initialState';

    @bindAs('test1')
    class ServiceProto1 {
      @onStart(initialStateName)
      onStart(initialState: any) {
        this.test(initialState);
        return true;
      }

      test = jest.fn();
    }

    @bindAs('test2')
    class ServiceProto2 {
      @onStart(initialStateName)
      onStart(initialState: any) {
        this.test(initialState);
        return true;
      }

      test = jest.fn();
    }

    const initialState = {};
    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    void startServices(binder, [getConfig(ServiceProto1, []), getConfig(ServiceProto2, [])]).then(
      ([data1, data2]) => {
        expect(data1.started).toBe(true);
        expect(binder.isBind('test1')).toBe(true);
        // @ts-expect-error TODO add type-safety
        expect(data1.service.test).toBeCalledWith(initialState);
        expect(data2.started).toBe(true);
        expect(binder.isBind('test2')).toBe(true);
        // @ts-expect-error TODO add type-safety
        expect(data2.service.test).toBeCalledWith(initialState);
        done();
      },
    );
  });

  it('startServices negative', done => {
    const initialStateName = 'initialState';

    @bindAs('test1')
    class ServiceProto1 {
      @onStart(initialStateName)
      onStart(initialState: any) {
        this.test(initialState);
        return false;
      }

      test = jest.fn();
    }

    const initialState = {};
    const binder = new Binder();
    binder.bind(initialState, { bindAs: initialStateName });

    startServices(binder, [getConfig(ServiceProto1, [])]).catch(error => {
      expect(!!error).toBe(true);
      done();
    });
  });

  it('stopServices', () => {
    const serviceName1 = 'test1';

    @bindAs(serviceName1)
    class ServiceProto1 {
      @onStop
      onStop(initialState: any) {
        this.test(initialState);
        return false;
      }

      test = jest.fn();
    }

    const serviceName2 = 'test2';

    @bindAs(serviceName2)
    class ServiceProto2 {
      @onStop
      onStop(initialState: any) {
        this.test(initialState);
        return false;
      }

      test = jest.fn();
    }

    const binder = new Binder();

    const service1 = new ServiceProto1();
    const config1 = getConfig(ServiceProto1, []);
    const service2 = new ServiceProto2();
    const config2 = getConfig(ServiceProto2, []);

    binder.bind(service1, config1.binderConfig);
    binder.bind(service2, config2.binderConfig);
    expect(binder.isBind(serviceName1)).toBe(true);
    expect(binder.isBind(serviceName2)).toBe(true);
    stopServices(binder, [getConfig(ServiceProto1, []), getConfig(ServiceProto2, [])]);
    expect(binder.isBind(serviceName1)).toBe(false);
    expect(service1.test).toBeCalled();
    expect(binder.isBind(serviceName2)).toBe(false);
    expect(service2.test).toBeCalled();
  });
});
