import Binder from '../Binder.js';

const s1 = 's1';
const s2 = 's2';
const s3 = 's3';
const s4 = 's4';

function createConfig(bindAs, onBind, onUnbind) {
  const config = {
    bindAs,
  };

  if (onBind) {
    config.onBind = onBind;
  }
  if (onBind) {
    config.onUnbind = onUnbind;
  }

  return config;
}
describe('DealDurationPresetService', () => {
  let binder;
  let localBinder;

  beforeEach(() => {
    binder = new Binder();
    localBinder = new Binder(binder);
  });


  /*  const t1 = 't1';
  const t2 = 't2';
  const t3 = 't3';
  const t4 = 't4';

  class Test1 {
    static config = {
      bindAs: t1,
      onBind: [
        [t2, t3, 'someMethod1'],
        [t3, t2, 'someMethod2'],
      ],
      onUnbind: [
        [t2, 'someMethod'],
        [t2, t3, 'someMethod'],
      ],
    };

    someMethod1() {}
    someMethod2() {}
  }

  class Test2 {
    static config = {
      bindAs: t2,
      onBind: [
        [t1, t3, 'someMethod'],
      ],
      onUnbind: [
        [t1, t3, 'someMethod'],
      ],
    };
    someMethod() {}
  }
  class Test3 {
    static config = {
      bindAs: t3,
      onBind: [
        [t2, 'someMethod'],
      ],
      onUnbind: [
        [t2, t1, 'someMethod'],
        [t1, 'someMethod'],
      ],
    };
    someMethod() {}
  }
  class Test4 {
    static config = {
      bindAs: t4,
    };
    someMethod() {}
  } */


  it('isBind', () => {
    // someMethod: jest.fn,
    binder.bind({}, createConfig(s1));
    expect(binder.isBind(s1)).toBe(true);
  });

  it('bind start with wrong params-1', () => {
    binder.bind(null);
    expect(binder.isBind(null)).toBe(false);
    binder.bind();
    expect(binder.isBind(undefined)).toBe(false);
    binder.bind(0);
    expect(binder.isBind(0)).toBe(false);
    binder.bind(s1);
    expect(binder.isBind(s1)).toBe(false);
  });

  it('bind start with wrong onBind param - 1', () => {
    binder.bind(s1, createConfig(s1, [[s1, s2]]));
    expect(binder.isBind(s1)).toBe(false);
  });

  it('bind start with wrong onBind param - 2', () => {
    binder.bind(s1, createConfig(s1, [[s2]]));
    expect(binder.isBind(s1)).toBe(false);
  });

  it('getStore', () => {
    const store = {};
    binder.bind(store, createConfig(s1));
    expect(binder.getStore(s1)).toBe(store);
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

  it('addStore', () => {
    // expect(t).toThrow(TypeError);
    binder.addStore({ someMethod() {} }, createConfig(s1, [[s2, s3, 'someMethod']], [[s2, 'someMethod']]));
    const settings = binder.getStoreSettings(s1);
    expect([settings.bindAs, settings.options]).toMatchSnapshot();
    expect(settings.options.onUnbind[0].__locked).toBe(true);
  });

  it('saveDeps', () => {
    binder.bind({ someMethod() {} }, createConfig(s1, [[s2, s3, 'someMethod']], [[s3, 'someMethod']]));
    expect(binder.depsList).toMatchSnapshot();
  });
});
