// @flow
import { Binder } from 'sources.js';


const binder = new Binder();
const binderLocal = new Binder(binder);


const StoreName = {
  Test1: 'Test1',
  Test2: 'Test2',
  Test3: 'Test3',
  Test4: 'Test4',
  Test5: 'Test5',
  Test1Local: 'Test1Local',
  Test2Local: 'Test2Local',
};


class Test1 {
  static config = {
    bindAs: StoreName.Test1,
    onBind: [[StoreName.Test2, StoreName.Test3, 'onBind']],
  };
  onBind(...arg) {
    console.log(['Test1 onBind', arg]);
  }
}

class Test2 {
  static config = {
    bindAs: StoreName.Test2,
    onBind: [
      [StoreName.Test1, 'onBind1'],
      [StoreName.Test3, 'onBind2'],
    ],

  };
  onBind1(...arg) {
    console.log(['Test2 onBind1', arg]);
  }
  onBind2(...arg) {
    console.log(['Test2 onBind2', arg]);
  }
}


class Test3 {
  static config = {
    bindAs: StoreName.Test3,
  };
  onBind(...arg) {
    console.log(['Test3 onBind', arg]);
  }
}


// binder.bind(new Test4(), Test4.config);
binder.bind(new Test1(), Test1.config);
binder.bind(new Test2(), Test2.config);
binder.bind(new Test3(), Test3.config);
console.log([11]);

setTimeout(() => {
  console.log(['setTimeout']);
  //binder.unbind(Test1.config.bindAs);
}, 1000);
