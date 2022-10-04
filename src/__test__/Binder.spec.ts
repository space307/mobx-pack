import { Binder } from '../Binder';
import { onStart, onStop, bindAs as bindAsDecor } from '../serviceDecorators';
import type { BinderConfig } from '../typing/common';
import { getConfig } from './utils';

const s1 = 's1';
const s2 = 's2';
const s3 = 's3';
const s4 = 's4';
const s5 = 's5';
const initialStateName = 'initialState';

function createConfig(
  bindAs: BinderConfig['bindAs'],
  onBind?: BinderConfig['onBind'] | null,
  onUnbind?: BinderConfig['onUnbind'] | null,
): BinderConfig {
  const config: BinderConfig = {
    bindAs,
  };

  if (onBind) {
    config.onBind = onBind;
  }
  if (onUnbind) {
    config.onUnbind = onUnbind;
  }

  return config;
}

function createService() {
  return {
    onBind1: jest.fn(),
    onBind2: jest.fn(),
    onUnbind1: jest.fn(),
    onUnbind2: jest.fn(),
  };
}

function clearServiceMocks(...services: Record<string, jest.MockedFn<any>>[]) {
  services.forEach(service => {
    for (const key in service) {
      if (Object.prototype.hasOwnProperty.call(service, key)) {
        const prop = service[key];

        if (typeof prop === 'function') {
          prop.mockClear();
        }
      }
    }
  });
}

describe('Binder', () => {
  it('isBind', () => {
    const binder = new Binder();
    // someMethod: jest.fn,
    binder.bind({}, createConfig(s1));
    expect(binder.isBind(s1)).toBe(true);
  });

  it('bind start with wrong params-1', () => {
    const binder = new Binder();

    expect(() => {
      // @ts-expect-error Expected
      binder.bind(null);
    }).toThrow();
    expect(() => {
      // @ts-expect-error Expected
      binder.bind();
    }).toThrow();
    expect(() => {
      // @ts-expect-error Expected
      binder.bind(0);
    }).toThrow();
    expect(() => {
      // @ts-expect-error Expected
      binder.bind(s1);
    }).toThrow();
  });

  it('bind start with wrong onBind param - 1', () => {
    const binder = new Binder();

    expect(() => {
      // @ts-expect-error Expected
      binder.bind(s1, createConfig(s1, [[s1, s2]]));
    }).toThrow();
  });

  it('bind start with wrong onBind param - 2', () => {
    const binder = new Binder();

    expect(() => {
      // @ts-expect-error Expected
      binder.bind(s1, createConfig(s1, [[s2]]));
    }).toThrow();
  });

  it('getService', () => {
    const binder = new Binder();
    const service = {};

    binder.bind(service, createConfig(s1));
    expect(binder.getService(s1)).toBe(service);
  });

  it('isListBind', () => {
    const binder = new Binder();

    binder.bind({}, createConfig(s1));
    binder.bind({}, createConfig(s2));
    expect(binder.isListBind([s1, s2])).toBe(true);
    expect(binder.isListBind([s1, s2, s3])).toBe(false);
  });

  it('isListUnBind', () => {
    const binder = new Binder();

    binder.bind({}, createConfig(s1));
    expect(binder.isListUnBind([s2, s3])).toBe(true);
    expect(binder.isListUnBind([s1, s2, s3])).toBe(false);
  });

  it('getNotBind', () => {
    const binder = new Binder();

    binder.bind({}, createConfig(s1));
    expect(binder.getNotBind([s1, s2, s3])).toEqual([s2, s3]);
  });

  it('getNotBind', () => {
    const binder = new Binder();

    binder.bind({}, createConfig(s1));
    expect(binder.getNotBind([s1, s2, s3])).toEqual([s2, s3]);
  });

  it('addService', () => {
    const binder = new Binder();

    // expect(t).toThrow(TypeError);
    binder.addService(
      {
        someMethod() {
          // empty
        },
      },
      createConfig(s1, [[s2, s3, 'someMethod']], [[s2, 'someMethod']]),
    );
    const settings = binder.getServiceSettings(s1);

    expect(settings).toBeDefined();
    expect([settings?.bindAs, settings?.options]).toMatchSnapshot();
    expect(settings?.options.onUnbind?.[0].__locked).toBe(true);
  });

  it('saveDeps', () => {
    const binder = new Binder();

    binder.bind(
      {
        someMethod() {
          // empty
        },
      },
      createConfig(s1, [[s2, s3, 'someMethod']], [[s3, 'someMethod']]),
    );
    expect(binder.depsList).toMatchSnapshot();
  });

  it('getServiceList', () => {
    const binder = new Binder();
    const service1 = {};
    const service2 = {};

    binder.bind(service1, createConfig(s1));
    binder.bind(service2, createConfig(s2));
    expect(binder.getServiceList([s1, s2])[0]).toBe(service1);
    expect(binder.getServiceList([s1, s2])[1]).toBe(service2);
  });

  it('setPendingStartResolver', () => {
    const binder = new Binder();
    const promise = Promise.resolve();

    // @ts-expect-error Expected
    binder.setPendingStartResolver(s1, promise);
    expect(binder.pendingStartResolvers[s1]).toBe(promise);
    binder.setPendingStartResolver(s1, null);
    expect(binder.pendingStartResolvers[s1]).toBe(undefined);
  });

  it('getPendingStartResolver', () => {
    const binder = new Binder();
    const promise = Promise.resolve();

    // @ts-expect-error Expected
    binder.setPendingStartResolver(s1, promise);
    expect(binder.getPendingStartResolver(s1)).toBe(promise);
  });

  it('createService', () => {
    const binder = new Binder();

    class Test {
      constructor(public a: number, public b: number) {}
    }

    const service = binder.createService(Test, [1, 2]);
    expect(service.a).toBe(1);
    expect(service.b).toBe(2);
  });

  it('createService error', () => {
    const binder = new Binder();

    class Test {
      constructor(public a: number, public b: number) {}
    }

    expect(() => {
      // @ts-expect-error Expected
      binder.createService(Test, 1);
    }).toThrow();
  });

  it('start async', async () => {
    const binder = new Binder();
    const serviceName = 'test';

    @bindAsDecor(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return new Promise(resolve => {
          setTimeout(resolve);
        });
      }
    }

    const initialState = {};
    binder.bind(initialState, { bindAs: initialStateName });

    const { service, started, serviceStartConfig } = await binder.start(
      getConfig(ServiceProto, []),
    );

    expect(binder.isBind(serviceName)).toBe(true);
    expect(serviceStartConfig.proto).toBe(ServiceProto);
    expect(started).toBe(true);
    expect(service).toBe(binder.getService(serviceName));
  });

  it('start negative start async', done => {
    const binder = new Binder();
    const serviceName = 'test';

    @bindAsDecor(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('error')));
        });
      }
    }

    const initialState = {};
    binder.bind(initialState, { bindAs: initialStateName });

    binder.start(getConfig(ServiceProto, [])).catch(error => {
      expect(!!error).toBe(true);
      done();
    });
  });

  it('start negative start sync', done => {
    const binder = new Binder();
    const serviceName = 'test';

    @bindAsDecor(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart() {
        return false;
      }
    }

    const initialState = {};
    binder.bind(initialState, { bindAs: initialStateName });

    binder.start(getConfig(ServiceProto, [])).catch(error => {
      expect(!!error).toBe(true);
      done();
    });
  });

  it('onStart callback', async () => {
    const binder = new Binder();
    const serviceName = 'test';
    const firstServiceName = 'firstService';
    const secondServiceName = 'secondService';

    @bindAsDecor(serviceName)
    class ServiceProto {
      @onStart(firstServiceName, secondServiceName)
      onStart(firstService: any, secondService: any) {
        this.test(firstService, secondService);
        return true;
      }

      test = jest.fn();
    }

    const firstService = {};
    const secondService = {};
    binder.bind(firstService, { bindAs: firstServiceName });
    binder.bind(secondService, { bindAs: secondServiceName });

    const { service } = await binder.start(getConfig(ServiceProto, []));
    expect(service.test).toBeCalledWith(firstService, secondService);
  });

  it('onStart fail if some service not bind', async () => {
    const binder = new Binder();
    const serviceName = 'test';
    const firstServiceName = 'firstService';
    const secondServiceName = 'secondService';

    @bindAsDecor(serviceName)
    class ServiceProto {
      @onStart(firstServiceName, secondServiceName)
      onStart(firstService: any, secondService: any) {
        this.test(firstService, secondService);
        return true;
      }

      test = jest.fn();
    }

    const firstService = {};
    binder.bind(firstService, { bindAs: firstServiceName });

    await expect(binder.start(getConfig(ServiceProto, []))).rejects.toBeDefined();
  });

  it('start fails if service prototype does not match service factory result', async () => {
    const binder = new Binder();
    const serviceName = 'test';

    @bindAsDecor(serviceName)
    class ServiceProto {}

    @bindAsDecor(serviceName)
    class ServiceProto2 {}

    const config = getConfig(ServiceProto, []);
    config.factory = () => new ServiceProto2();

    await expect(binder.start(config)).rejects.toBeDefined();
  });

  it('start fails if service fabric return invalid result', async () => {
    const binder = new Binder();
    const serviceName = 'test';

    @bindAsDecor(serviceName)
    class ServiceProto {}

    const config = getConfig(ServiceProto, []);
    // @ts-expect-error Expected
    config.factory = () => null;

    await expect(binder.start(config)).rejects.toBeDefined();
  });

  it('double service start && Promise', done => {
    const binder = new Binder();
    const serviceName = 'test';

    @bindAsDecor(serviceName)
    class ServiceProto {
      @onStart(initialStateName)
      onStart(initialState: any) {
        this.test(initialState);
        return new Promise(resolve => {
          setTimeout(resolve);
        });
      }

      test = jest.fn();
    }

    let readyService: object;

    const initialState = {};
    binder.bind(initialState, { bindAs: initialStateName });

    void binder.start(getConfig(ServiceProto, [])).then(({ service }) => {
      readyService = service;
    });

    void binder.start(getConfig(ServiceProto, [])).then(({ service }) => {
      expect(service).toBe(readyService);
      expect(service.test).toBeCalledTimes(1);
      done();
    });
  });

  it('stopService', () => {
    const binder = new Binder();
    const serviceName = 'test';

    @bindAsDecor(serviceName)
    class ServiceProto {
      @onStop
      onStop(initialState: any) {
        this.test(initialState);
        return false;
      }

      test = jest.fn();
    }

    const service = new ServiceProto();
    const config = getConfig(ServiceProto, []);

    binder.bind(service, config.binderConfig);
    expect(binder.isBind(serviceName)).toBe(true);
    binder.stop(getConfig(ServiceProto, []));

    expect(binder.isBind(serviceName)).toBe(false);
    expect(service.test).toBeCalled();
  });

  describe('onBindTest', () => {
    function expectSimpleOnBindTest(service1: any, service2: any, service3: any) {
      expect(service1.onBind1).toBeCalledWith(service2, service3);
      expect(service1.onBind2).toBeCalledWith(service3);
      expect(service2.onBind1).toBeCalledWith(service1, service3);
      expect(service2.onBind2).toBeCalledWith(service1);
      expect(service3.onBind1).toBeCalledWith(service2, service1);
      expect(service3.onBind2).toBeCalledWith(service2);
    }

    it('simple onBind test', () => {
      const binder = new Binder();
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(
        service1,
        createConfig(s1, [
          [s2, s3, 'onBind1'],
          [s3, 'onBind2'],
        ]),
      );
      binder.bind(
        service2,
        createConfig(s2, [
          [s1, s3, 'onBind1'],
          [s1, 'onBind2'],
        ]),
      );
      binder.bind(
        service3,
        createConfig(s3, [
          [s2, s1, 'onBind1'],
          [s2, 'onBind2'],
        ]),
      );

      expectSimpleOnBindTest(service1, service2, service3);
    });

    it('simple onBind test & different order', () => {
      const binder = new Binder();
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(
        service2,
        createConfig(s2, [
          [s1, s3, 'onBind1'],
          [s1, 'onBind2'],
        ]),
      );
      binder.bind(
        service1,
        createConfig(s1, [
          [s2, s3, 'onBind1'],
          [s3, 'onBind2'],
        ]),
      );
      binder.bind(
        service3,
        createConfig(s3, [
          [s2, s1, 'onBind1'],
          [s2, 'onBind2'],
        ]),
      );

      expectSimpleOnBindTest(service1, service2, service3);
    });

    it('simple onBind test & unbind', () => {
      const binder = new Binder();
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(
        service2,
        createConfig(s2, [
          [s1, s3, 'onBind1'],
          [s1, 'onBind2'],
        ]),
      );
      binder.bind(
        service1,
        createConfig(s1, [
          [s2, s3, 'onBind1'],
          [s3, 'onBind2'],
        ]),
      );
      binder.unbind(s1);
      binder.bind(
        service3,
        createConfig(s3, [
          [s2, s1, 'onBind1'],
          [s2, 'onBind2'],
        ]),
      );
      binder.unbind(s2);
      binder.bind(
        service1,
        createConfig(s1, [
          [s2, s3, 'onBind1'],
          [s3, 'onBind2'],
        ]),
      );
      binder.bind(
        service2,
        createConfig(s2, [
          [s1, s3, 'onBind1'],
          [s1, 'onBind2'],
        ]),
      );

      expectSimpleOnBindTest(service1, service2, service3);
    });

    it('repeat onBind if service unbind', () => {
      const binder = new Binder();
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1']]));
      binder.bind(service2, createConfig(s2));
      binder.bind(service3, createConfig(s3));
      binder.unbind(s2);
      binder.unbind(s3);
      binder.bind(service2, createConfig(s2));

      expect(service1.onBind1).toBeCalledTimes(1);
      binder.bind(service3, createConfig(s3));
      expect(service1.onBind1).toBeCalledTimes(2);
    });

    it('simple onUnbind test', () => {
      const binder = new Binder();
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(
        service1,
        createConfig(s1, null, [
          [s2, s3, 'onUnbind1'],
          [s2, 'onUnbind2'],
        ]),
      );
      binder.bind(
        service2,
        createConfig(s2, null, [
          [s1, s3, 'onUnbind1'],
          [s1, 'onUnbind2'],
        ]),
      );
      binder.bind(
        service3,
        createConfig(s3, null, [
          [s2, s1, 'onUnbind1'],
          [s2, 'onUnbind2'],
        ]),
      );

      binder.unbind(s2);
      binder.unbind(s3);
      binder.unbind(s1);

      expect(service1.onUnbind1).toBeCalled();
      expect(service1.onUnbind2).toBeCalled();
      expect(service3.onUnbind2).toBeCalled();
    });

    it('simple onUnbind test if service bind', () => {
      const binder = new Binder();
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(
        service1,
        createConfig(s1, null, [
          [s2, s3, 'onUnbind1'],
          [s2, 'onUnbind2'],
        ]),
      );
      binder.bind(
        service2,
        createConfig(s2, null, [
          [s1, s3, 'onUnbind1'],
          [s1, 'onUnbind2'],
        ]),
      );
      binder.bind(
        service3,
        createConfig(s3, null, [
          [s2, s1, 'onUnbind1'],
          [s1, 'onUnbind2'],
        ]),
      );
      binder.unbind(s1);
      binder.unbind(s2);
      binder.bind(
        service1,
        createConfig(s1, null, [
          [s2, s3, 'onUnbind1'],
          [s2, 'onUnbind2'],
        ]),
      );
      binder.unbind(s1);
      binder.bind(
        service1,
        createConfig(s1, null, [
          [s2, s3, 'onUnbind1'],
          [s2, 'onUnbind2'],
        ]),
      );
      binder.bind(
        service2,
        createConfig(s2, null, [
          [s1, s3, 'onUnbind1'],
          [s1, 'onUnbind2'],
        ]),
      );
      binder.unbind(s1);
      binder.unbind(s2);

      expect(service3.onUnbind1).toBeCalledTimes(2);
      expect(service3.onUnbind2).toBeCalledTimes(3);
    });

    it('localBinder test', () => {
      const binder = new Binder();
      const localBinder = new Binder(binder);
      const service1 = createService();
      const service2 = createService();

      binder.bind(service1, createConfig(s1));
      localBinder.bind(service2, createConfig(s2, [[s1, 'onBind1']], [[s1, 'onUnbind1']]));
      binder.unbind(s1);
      binder.bind(service1, createConfig(s1));

      expect(service2.onBind1).toBeCalledWith(service1);
      expect(service2.onBind1).toBeCalledTimes(2);
      expect(service2.onUnbind1).toBeCalledTimes(1);
    });

    it('common binder + localBinder test', () => {
      const binder = new Binder();
      const localBinder = new Binder(binder);
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();
      const service4 = createService();
      const service5 = createService();

      binder.bind(
        service1,
        createConfig(s1, [
          [s2, s3, 'onBind1'],
          [s2, 'onBind2'],
        ]),
      );
      binder.bind(
        service2,
        createConfig(s2, [
          [s1, s3, 'onBind1'],
          [s1, 'onBind2'],
        ]),
      );
      binder.bind(
        service3,
        createConfig(
          s3,
          [
            [s2, s1, 'onBind1'],
            [s1, 'onBind2'],
          ],
          [
            [s2, s1, 'onUnbind1'],
            [s1, 'onUnbind2'],
          ],
        ),
      );
      localBinder.bind(
        service4,
        createConfig(s4, [
          [s5, s1, 'onBind1'],
          [s1, 'onBind2'],
        ]),
      );
      localBinder.bind(
        service5,
        createConfig(
          s5,
          [
            [s4, s2, 'onBind1'],
            [s2, 'onBind2'],
          ],
          [
            [s4, s2, 'onUnbind1'],
            [s2, 'onUnbind2'],
          ],
        ),
      );

      expect(service1.onBind1).toBeCalledWith(service2, service3);
      expect(service1.onBind1).toBeCalledTimes(1);
      expect(service1.onBind2).toBeCalledWith(service2);
      expect(service1.onBind2).toBeCalledTimes(1);

      expect(service2.onBind1).toBeCalledWith(service1, service3);
      expect(service2.onBind1).toBeCalledTimes(1);
      expect(service2.onBind2).toBeCalledWith(service1);
      expect(service2.onBind2).toBeCalledTimes(1);

      expect(service3.onBind1).toBeCalledWith(service2, service1);
      expect(service3.onBind1).toBeCalledTimes(1);
      expect(service3.onBind2).toBeCalledWith(service1);
      expect(service3.onBind2).toBeCalledTimes(1);

      expect(service4.onBind1).toBeCalledWith(service5, service1);
      expect(service4.onBind1).toBeCalledTimes(1);
      expect(service4.onBind2).toBeCalledWith(service1);
      expect(service4.onBind2).toBeCalledTimes(1);

      expect(service5.onBind1).toBeCalledWith(service4, service2);
      expect(service5.onBind1).toBeCalledTimes(1);
      expect(service5.onBind2).toBeCalledWith(service2);
      expect(service5.onBind2).toBeCalledTimes(1);

      clearServiceMocks(service1, service2, service3, service4, service5);

      binder.unbind(s1);
      binder.unbind(s2);
      binder.bind(
        service1,
        createConfig(s1, [
          [s2, s3, 'onBind1'],
          [s2, 'onBind2'],
        ]),
      );
      binder.unbind(s1);
      binder.bind(
        service1,
        createConfig(s1, [
          [s2, s3, 'onBind1'],
          [s2, 'onBind2'],
        ]),
      );
      expect(service3.onUnbind1).toBeCalledTimes(1);
      expect(service3.onUnbind2).toBeCalledTimes(2);
      binder.bind(
        service2,
        createConfig(s2, [
          [s1, s3, 'onBind1'],
          [s1, 'onBind2'],
        ]),
      );

      expect(service3.onBind1).toBeCalledWith(service2, service1);
      expect(service3.onBind1).toBeCalledTimes(1);
      expect(service3.onBind2).toBeCalledWith(service1);
      expect(service3.onBind2).toBeCalledTimes(2);

      clearServiceMocks(service1, service2, service3, service4, service5);
      binder.unbind(s2);
      localBinder.unbind(s4);

      expect(service5.onUnbind1).toBeCalledTimes(1);
      expect(service5.onUnbind2).toBeCalledTimes(1);
    });
  });
});
