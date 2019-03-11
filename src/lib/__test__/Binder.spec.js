import Binder from '../Binder.js';

const t1 = 't1';
const t2 = 't2';
const t3 = 't3';
const t4 = 't4';

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


  it('setPreset', () => {
    binder.bind({
      someMethod: jest.fn,
    },
    createConfig(0, [
      t2, 'someMethod',
    ]));

 /*   binder.bind({
      someMethod: jest.fn,
    },
    createConfig(t2, [
      t1, 'someMethod',
    ]));*/


    console.log([123, binder.stores]);

    /*    jest.fn((count: number, ds: *, cb: *): void => {
      setTimeout(() => {
        cb(0);
      });
    }); */


    expect(2).toBe(2);
  });
});
