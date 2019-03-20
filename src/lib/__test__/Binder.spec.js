import { each } from 'lodash';
import Binder from '../Binder.js';


const s1 = 's1';
const s2 = 's2';
const s3 = 's3';
const s4 = 's4';
const s5 = 's5';


function createConfig(bindAs, onBind, onUnbind) {
  const config = {
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

function clearServiceMocks(...services) {
  services.forEach((service) => {
    each(service, (prop) => {
      if (typeof prop === 'function') {
        prop.mockClear();
      }
    });
  });
}


describe('Binder test', () => {
  let binder;
  let localBinder;

  beforeEach(() => {
    binder = new Binder();
    localBinder = new Binder(binder);
  });

  it('isBind', () => {
    // someMethod: jest.fn,
    binder.bind({}, createConfig(s1));
    expect(binder.isBind(s1)).toBe(true);
  });

  it('bind start with wrong params-1', () => {
    expect(() => { binder.bind(null); }).toThrow();
    expect(() => { binder.bind(); }).toThrow();
    expect(() => { binder.bind(0); }).toThrow();
    expect(() => { binder.bind(s1); }).toThrow();
  });

  it('bind start with wrong onBind param - 1', () => {
    expect(() => { binder.bind(s1, createConfig(s1, [[s1, s2]])); }).toThrow();
  });

  it('bind start with wrong onBind param - 2', () => {
    expect(() => { binder.bind(s1, createConfig(s1, [[s2]])); }).toThrow();
  });

  it('getService', () => {
    const service = {};
    binder.bind(service, createConfig(s1));
    expect(binder.getService(s1)).toBe(service);
  });

  it('isListBind', () => {
    binder.bind({}, createConfig(s1));
    binder.bind({}, createConfig(s2));
    expect(binder.isListBind([s1, s2])).toBe(true);
    expect(binder.isListBind([s1, s2, s3])).toBe(false);
  });


  it('isListUnBind', () => {
    binder.bind({}, createConfig(s1));
    expect(binder.isListUnBind([s2, s3])).toBe(true);
    expect(binder.isListUnBind([s1, s2, s3])).toBe(false);
  });

  it('getNotBind', () => {
    binder.bind({}, createConfig(s1));
    expect(binder.getNotBind([s1, s2, s3])).toEqual([s2, s3]);
  });

  it('getNotBind', () => {
    binder.bind({}, createConfig(s1));
    expect(binder.getNotBind([s1, s2, s3])).toEqual([s2, s3]);
  });

  it('addService', () => {
    // expect(t).toThrow(TypeError);
    binder.addService({ someMethod() {} }, createConfig(s1, [[s2, s3, 'someMethod']], [[s2, 'someMethod']]));
    const settings = binder.getServiceSettings(s1);
    expect([settings.bindAs, settings.options]).toMatchSnapshot();
    expect(settings.options.onUnbind[0].__locked).toBe(true);
  });

  it('saveDeps', () => {
    binder.bind({ someMethod() {} }, createConfig(s1, [[s2, s3, 'someMethod']], [[s3, 'someMethod']]));
    expect(binder.depsList).toMatchSnapshot();
  });

  it('getServiceList', () => {
    const service1 = {};
    const service2 = {};
    binder.bind(service1, createConfig(s1));
    binder.bind(service2, createConfig(s2));
    expect(binder.getServiceList([s1, s2])[0]).toBe(service1);
    expect(binder.getServiceList([s1, s2])[1]).toBe(service2);
  });

  it('setPendingStartResolver', () => {
    const promise = Promise;
    binder.setPendingStartResolver(s1, promise);
    expect(binder.pendingStartResolvers[s1]).toBe(promise);
    binder.setPendingStartResolver(s1, null);
    expect(binder.pendingStartResolvers[s1]).toBe(undefined);
  });

  it('getPendingStartResolver', () => {
    const promise = Promise;
    binder.setPendingStartResolver(s1, promise);
    expect(binder.getPendingStartResolver(s1)).toBe(promise);
  });

  describe('onBindTest', () => {
    function expectSimpleOnBindTest(service1, service2, service3) {
      expect(service1.onBind1).toBeCalledWith(service2, service3);
      expect(service1.onBind2).toBeCalledWith(service3);
      expect(service2.onBind1).toBeCalledWith(service1, service3);
      expect(service2.onBind2).toBeCalledWith(service1);
      expect(service3.onBind1).toBeCalledWith(service2, service1);
      expect(service3.onBind2).toBeCalledWith(service2);
    }

    it('simple onBind test', () => {
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.bind(service2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(service3, createConfig(s3, [[s2, s1, 'onBind1'], [s2, 'onBind2']]));

      expectSimpleOnBindTest(service1, service2, service3);
    });

    it('simple onBind test & different order', () => {
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(service2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.bind(service3, createConfig(s3, [[s2, s1, 'onBind1'], [s2, 'onBind2']]));

      expectSimpleOnBindTest(service1, service2, service3);
    });

    it('simple onBind test & unbind', () => {
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(service2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.unbind(s1);
      binder.bind(service3, createConfig(s3, [[s2, s1, 'onBind1'], [s2, 'onBind2']]));
      binder.unbind(s2);
      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.bind(service2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));

      expectSimpleOnBindTest(service1, service2, service3);
    });


    it('repeat onBind if service unbind', () => {
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
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(service1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.bind(service2, createConfig(s2, null, [[s1, s3, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.bind(service3, createConfig(s3, null, [[s2, s1, 'onUnbind1'], [s2, 'onUnbind2']]));

      binder.unbind(s2);
      binder.unbind(s3);
      binder.unbind(s1);

      expect(service1.onUnbind1).toBeCalled();
      expect(service1.onUnbind2).toBeCalled();
      expect(service3.onUnbind2).toBeCalled();
    });

    it('simple onUnbind test if service bind', () => {
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();

      binder.bind(service1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.bind(service2, createConfig(s2, null, [[s1, s3, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.bind(service3, createConfig(s3, null, [[s2, s1, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.unbind(s1);
      binder.unbind(s2);
      binder.bind(service1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.unbind(s1);
      binder.bind(service1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.bind(service2, createConfig(s2, null, [[s1, s3, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.unbind(s1);
      binder.unbind(s2);

      expect(service3.onUnbind1).toBeCalledTimes(2);
      expect(service3.onUnbind2).toBeCalledTimes(3);
    });

    it('localBinder test', () => {
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
      const service1 = createService();
      const service2 = createService();
      const service3 = createService();
      const service4 = createService();
      const service5 = createService();

      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1'], [s2, 'onBind2']]));
      binder.bind(service2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(service3, createConfig(s3, [[s2, s1, 'onBind1'], [s1, 'onBind2']],
        [[s2, s1, 'onUnbind1'], [s1, 'onUnbind2']]));
      localBinder.bind(service4, createConfig(s4, [[s5, s1, 'onBind1'], [s1, 'onBind2']]));
      localBinder.bind(service5, createConfig(s5, [[s4, s2, 'onBind1'], [s2, 'onBind2']],
        [[s4, s2, 'onUnbind1'], [s2, 'onUnbind2']]));

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
      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1'], [s2, 'onBind2']]));
      binder.unbind(s1);
      binder.bind(service1, createConfig(s1, [[s2, s3, 'onBind1'], [s2, 'onBind2']]));
      expect(service3.onUnbind1).toBeCalledTimes(1);
      expect(service3.onUnbind2).toBeCalledTimes(2);
      binder.bind(service2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));

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
