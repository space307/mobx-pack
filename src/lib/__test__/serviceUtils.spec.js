import '@babel/polyfill';
import { createService, startService, startServices, stopService, stopServices } from '../serviceUtils.js';
import Binder from '../Binder.js';
import { onStart, bindAs, onStop } from '../ServiceDecorators.js';


function getConfig(ServiceProto) {
  const serviceStartConfigData = {
    proto: ServiceProto,
    protoAttrs: [1, 2],
    binderConfig: ServiceProto.binderConfig,
  };

  return serviceStartConfigData;
}


describe('serviceUtils test', () => {
  it('createService', () => {
    class Test {
      constructor(a, b) {
        this.a = a;
        this.b = b;
      }
    }
    const service = createService(Test, [1, 2]);
    expect(service.a).toBe(1);
    expect(service.b).toBe(2);
  });

  it('createService error', () => {
    class Test {
      constructor(a, b) {
        this.a = a;
        this.b = b;
      }
    }
    expect(() => { createService(Test, 1); }).toThrow();
  });

  it('startService async', (done) => {
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

    startService(getConfig(ServiceProto), binder, initialState).then(({ service, started, serviceStartConfig }) => {
      expect(binder.isBind(storeName)).toBe(true);
      expect(serviceStartConfig.proto).toBe(ServiceProto);
      expect(started).toBe(true);
      expect(service).toBe(binder.getStore(storeName));
      done();
    });
  });

  it('startService async', (done) => {
    const storeName = 'test';

    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart() {
        return true;
      }
    }

    const initialState = {};

    const binder = new Binder();
    startService(getConfig(ServiceProto), binder, initialState).then(({ service, started, serviceStartConfig }) => {
      expect(binder.isBind(storeName)).toBe(true);
      expect(serviceStartConfig.proto).toBe(ServiceProto);
      expect(started).toBe(true);
      expect(service).toBe(binder.getStore(storeName));
      done();
    });
  });

  it('startService negative start async', (done) => {
    const storeName = 'test';

    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart() {
        return new Promise(
          (resolve, reject) => {
            setTimeout(() => { reject(new Error('error')); });
          },
        );
      }
    }

    const initialState = {};

    const binder = new Binder();
    startService(getConfig(ServiceProto), binder, initialState).catch((error) => {
      expect(!!error).toBe(true);
      done();
    });
  });

  it('startService negative start sync', (done) => {
    const storeName = 'test';

    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart() {
        return false;
      }
    }

    const initialState = {};

    const binder = new Binder();
    startService(getConfig(ServiceProto), binder, initialState).catch((error) => {
      expect(!!error).toBe(true);
      done();
    });
  });


  it('onStart callback', (done) => {
    const storeName = 'test';

    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart(initialState) {
        this.test(initialState);
        return true;
      }
      test = jest.fn();
    }

    const initialState = {};

    const binder = new Binder();
    startService(getConfig(ServiceProto), binder, initialState).then(({ service }) => {
      expect(service.test).toBeCalledWith(initialState);
      done();
    });
  });

  it('double service start && Promise', (done) => {
    const storeName = 'test';

    @bindAs(storeName)
    class ServiceProto {
      @onStart
      onStart(initialState) {
        this.test(initialState);
        return new Promise(
          (resolve) => {
            setTimeout(() => {
              resolve();
            });
          },
        );
      }
      test = jest.fn();
    }

    let readyService;

    const initialState = {};
    const binder = new Binder();


    startService(getConfig(ServiceProto), binder, initialState).then(({ service }) => {
      readyService = service;
    });

    startService(getConfig(ServiceProto), binder, initialState).then(({ service }) => {
      expect(service).toBe(readyService);
      expect(service.test).toBeCalledTimes(1);
      done();
    });
  });


  it('startServices', (done) => {
    @bindAs('test1')
    class ServiceProto1 {
      @onStart
      onStart(initialState) {
        this.test(initialState);
        return true;
      }
      test = jest.fn();
    }

    @bindAs('test2')
    class ServiceProto2 {
      @onStart
      onStart(initialState) {
        this.test(initialState);
        return true;
      }
      test = jest.fn();
    }


    const initialState = {};
    const binder = new Binder();

    startServices(binder, initialState, [getConfig(ServiceProto1), getConfig(ServiceProto2)]).then(([data1, data2]) => {
      expect(data1.started).toBe(true);
      expect(binder.isBind('test1')).toBe(true);
      expect(data1.service.test).toBeCalledWith(initialState);
      expect(data2.started).toBe(true);
      expect(binder.isBind('test2')).toBe(true);
      expect(data2.service.test).toBeCalledWith(initialState);
      done();
    });
  });

  it('startServices negative', (done) => {
    @bindAs('test1')
    class ServiceProto1 {
      @onStart
      onStart(initialState) {
        this.test(initialState);
        return false;
      }
      test = jest.fn();
    }

    const initialState = {};
    const binder = new Binder();

    startServices(binder, initialState, [getConfig(ServiceProto1)]).catch((error) => {
      expect(!!error).toBe(true);
      done();
    });
  });

  it('stopService', () => {
    const storeName = 'test';
    @bindAs(storeName)
    class ServiceProto {
      @onStop
      onStop(initialState) {
        this.test(initialState);
        return false;
      }
      test = jest.fn();
    }
    const binder = new Binder();

    const service = new ServiceProto();
    const config = getConfig(ServiceProto);

    binder.bind(service, config.binderConfig.config);
    expect(binder.isBind(storeName)).toBe(true);
    stopService(binder, getConfig(ServiceProto));

    expect(binder.isBind(storeName)).toBe(false);
    expect(service.test).toBeCalled();
  });

  it('stopServices', () => {
    const storeName1 = 'test1';
    @bindAs(storeName1)
    class ServiceProto1 {
      @onStop
      onStop(initialState) {
        this.test(initialState);
        return false;
      }
      test = jest.fn();
    }

    const storeName2 = 'test2';
    @bindAs(storeName2)
    class ServiceProto2 {
      @onStop
      onStop(initialState) {
        this.test(initialState);
        return false;
      }
      test = jest.fn();
    }

    const binder = new Binder();

    const service1 = new ServiceProto1();
    const config1 = getConfig(ServiceProto1);
    const service2 = new ServiceProto2();
    const config2 = getConfig(ServiceProto2);

    binder.bind(service1, config1.binderConfig.config);
    binder.bind(service2, config2.binderConfig.config);
    expect(binder.isBind(storeName1)).toBe(true);
    expect(binder.isBind(storeName2)).toBe(true);
    stopServices(binder, [getConfig(ServiceProto1), getConfig(ServiceProto2)]);
    expect(binder.isBind(storeName1)).toBe(false);
    expect(service1.test).toBeCalled();
    expect(binder.isBind(storeName2)).toBe(false);
    expect(service2.test).toBeCalled();
  });
});
