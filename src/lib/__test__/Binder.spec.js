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

function createStore() {
  return {
    onBind1: jest.fn(),
    onBind2: jest.fn(),
    onUnbind1: jest.fn(),
    onUnbind2: jest.fn(),
  };
}

function clearStoreMocks(...stores) {
  stores.forEach((store) => {
    each(store, (prop) => {
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


    it('repeat onBind if service unbind', () => {
      const store1 = createStore();
      const store2 = createStore();
      const store3 = createStore();

      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1']]));
      binder.bind(store2, createConfig(s2));
      binder.bind(store3, createConfig(s3));
      binder.unbind(s2);
      binder.unbind(s3);
      binder.bind(store2, createConfig(s2));

      expect(store1.onBind1).toBeCalledTimes(1);
      binder.bind(store3, createConfig(s3));
      expect(store1.onBind1).toBeCalledTimes(2);
    });

    it('simple onUnbind test', () => {
      const store1 = createStore();
      const store2 = createStore();
      const store3 = createStore();

      binder.bind(store1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.bind(store2, createConfig(s2, null, [[s1, s3, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.bind(store3, createConfig(s3, null, [[s2, s1, 'onUnbind1'], [s2, 'onUnbind2']]));

      binder.unbind(s2);
      binder.unbind(s3);
      binder.unbind(s1);

      expect(store1.onUnbind1).toBeCalled();
      expect(store1.onUnbind2).toBeCalled();
      expect(store3.onUnbind2).toBeCalled();
    });

    it('simple onUnbind test if service bind', () => {
      const store1 = createStore();
      const store2 = createStore();
      const store3 = createStore();

      binder.bind(store1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.bind(store2, createConfig(s2, null, [[s1, s3, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.bind(store3, createConfig(s3, null, [[s2, s1, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.unbind(s1);
      binder.unbind(s2);
      binder.bind(store1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.unbind(s1);
      binder.bind(store1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
      binder.bind(store2, createConfig(s2, null, [[s1, s3, 'onUnbind1'], [s1, 'onUnbind2']]));
      binder.unbind(s1);
      binder.unbind(s2);

      expect(store3.onUnbind1).toBeCalledTimes(2);
      expect(store3.onUnbind2).toBeCalledTimes(3);
    });

    it('localBinder test', () => {
      const store1 = createStore();
      const store2 = createStore();

      binder.bind(store1, createConfig(s1));
      localBinder.bind(store2, createConfig(s2, [[s1, 'onBind1']], [[s1, 'onUnbind1']]));
      binder.unbind(s1);
      binder.bind(store1, createConfig(s1));

      expect(store2.onBind1).toBeCalledWith(store1);
      expect(store2.onBind1).toBeCalledTimes(2);
      expect(store2.onUnbind1).toBeCalledTimes(1);
    });


    it('common binder + localBinder test', () => {
      const store1 = createStore();
      const store2 = createStore();
      const store3 = createStore();
      const store4 = createStore();
      const store5 = createStore();

      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1'], [s2, 'onBind2']]));
      binder.bind(store2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));
      binder.bind(store3, createConfig(s3, [[s2, s1, 'onBind1'], [s1, 'onBind2']],
        [[s2, s1, 'onUnbind1'], [s1, 'onUnbind2']]));
      localBinder.bind(store4, createConfig(s4, [[s5, s1, 'onBind1'], [s1, 'onBind2']]));
      localBinder.bind(store5, createConfig(s5, [[s4, s2, 'onBind1'], [s2, 'onBind2']],
        [[s4, s2, 'onUnbind1'], [s2, 'onUnbind2']]));

      expect(store1.onBind1).toBeCalledWith(store2, store3);
      expect(store1.onBind1).toBeCalledTimes(1);
      expect(store1.onBind2).toBeCalledWith(store2);
      expect(store1.onBind2).toBeCalledTimes(1);

      expect(store2.onBind1).toBeCalledWith(store1, store3);
      expect(store2.onBind1).toBeCalledTimes(1);
      expect(store2.onBind2).toBeCalledWith(store1);
      expect(store2.onBind2).toBeCalledTimes(1);

      expect(store3.onBind1).toBeCalledWith(store2, store1);
      expect(store3.onBind1).toBeCalledTimes(1);
      expect(store3.onBind2).toBeCalledWith(store1);
      expect(store3.onBind2).toBeCalledTimes(1);

      expect(store4.onBind1).toBeCalledWith(store5, store1);
      expect(store4.onBind1).toBeCalledTimes(1);
      expect(store4.onBind2).toBeCalledWith(store1);
      expect(store4.onBind2).toBeCalledTimes(1);

      expect(store5.onBind1).toBeCalledWith(store4, store2);
      expect(store5.onBind1).toBeCalledTimes(1);
      expect(store5.onBind2).toBeCalledWith(store2);
      expect(store5.onBind2).toBeCalledTimes(1);

      clearStoreMocks(store1, store2, store3, store4, store5);

      binder.unbind(s1);
      binder.unbind(s2);
      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1'], [s2, 'onBind2']]));
      binder.unbind(s1);
      binder.bind(store1, createConfig(s1, [[s2, s3, 'onBind1'], [s2, 'onBind2']]));
      expect(store3.onUnbind1).toBeCalledTimes(1);
      expect(store3.onUnbind2).toBeCalledTimes(2);
      binder.bind(store2, createConfig(s2, [[s1, s3, 'onBind1'], [s1, 'onBind2']]));

      expect(store3.onBind1).toBeCalledWith(store2, store1);
      expect(store3.onBind1).toBeCalledTimes(1);
      expect(store3.onBind2).toBeCalledWith(store1);
      expect(store3.onBind2).toBeCalledTimes(2);

      clearStoreMocks(store1, store2, store3, store4, store5);
      binder.unbind(s2);
      localBinder.unbind(s4);

      expect(store5.onUnbind1).toBeCalledTimes(1);
      expect(store5.onUnbind2).toBeCalledTimes(1);
    });
  });
});
