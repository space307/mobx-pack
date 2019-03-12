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

function createStore() {
  return {
    onBind1: jest.fn(),
    onBind2: jest.fn(),
    onUnbind1: jest.fn(),
    onUnbind2: jest.fn(),
  };
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

  it('getStoreList', () => {
    const store1 = {};
    const store2 = {};
    binder.bind(store1, createConfig(s1));
    binder.bind(store2, createConfig(s2));
    expect(binder.getStoreList([s1, s2])[0]).toBe(store1);
    expect(binder.getStoreList([s1, s2])[1]).toBe(store2);
  });


  describe('onBindTest', () => {
    function expectSimpleOnBindTest(store1, store2, store3) {
      expect(store1.onBind1).toBeCalledWith(store2, store3);
      expect(store1.onBind2).toBeCalledWith(store3);
      expect(store2.onBind1).toBeCalledWith(store1, store3);
      expect(store2.onBind2).toBeCalledWith(store1);
      expect(store3.onBind1).toBeCalledWith(store2, store1);
      expect(store3.onBind2).toBeCalledWith(store2);
    }

    it('simple onBind test', () => {
      const store1 = createStore();
      const store2 = createStore();
      const store3 = createStore();

      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.bind(store2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(store3, createConfig(s3, [[s2, s1, 'onBind1'], [s2, 'onBind2']]));

      expectSimpleOnBindTest(store1, store2, store3);
    });

    it('simple onBind test & different order', () => {
      const store1 = createStore();
      const store2 = createStore();
      const store3 = createStore();

      binder.bind(store2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.bind(store3, createConfig(s3, [[s2, s1, 'onBind1'], [s2, 'onBind2']]));

      expectSimpleOnBindTest(store1, store2, store3);
    });

    it('simple onBind test & unbind', () => {
      const store1 = createStore();
      const store2 = createStore();
      const store3 = createStore();

      binder.bind(store2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.unbind(s1);
      binder.bind(store3, createConfig(s3, [[s2, s1, 'onBind1'], [s2, 'onBind2']]));
      binder.unbind(s2);
      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1'], [s3, 'onBind2']]));
      binder.bind(store2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));

      expectSimpleOnBindTest(store1, store2, store3);
    });

  });
});
