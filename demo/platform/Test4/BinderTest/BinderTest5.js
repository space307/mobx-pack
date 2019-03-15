/* eslint-disable */
// @flow
import { Binder } from 'sources.js';


const binder = new Binder();
//const binderLocal = new Binder(binder);


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
    onBind: [
      [StoreName.Test2, 'onBind2'],
      [StoreName.Test2, StoreName.Test3, 'onBind23'],
    ],
    onUnbind: [
      [StoreName.Test2, 'onUnbind2'],
      [StoreName.Test2, StoreName.Test3, 'onUnbind23'],
    ],
  };
  onBind2(...arg) {
    //console.log(['Test1 onBind2', arg]);
  }
  onBind23(...arg) {
    //console.log(['Test1 onBind23', arg]);
  }
  onUnbind2(...arg) {
    //console.log(['Test1 onUnbind2', arg]);
  }
  onUnbind23(...arg) {
    //console.log(['Test1 onUnbind23', arg]);
  }
}

class Test2 {
  static config = {
    bindAs: StoreName.Test2,
    onBind: [
      [StoreName.Test1, 'onBind'],
    ],
  };
  onBind(...arg) {
    //console.log(['Test2 onBind', arg]);
  }
}

class Test3 {
  static config = {
    bindAs: StoreName.Test3,
  };
}

binder.emitter.subscribe('CALLBACK_CALLED', ({ bindAs, callbackType, callback, storeList })=>{
  console.log([bindAs, callbackType, storeList.join(',')]);
});

// Test1, onBind(Test2), bind(Test2, Test3), onUnbind(Test2), onUnbind(Test2, Test3)
// Test2, onBind(Test1),
binder.bind(new Test1(), Test1.config);
binder.bind(new Test2(), Test2.config);
binder.bind(new Test3(), Test3.config);

//binder.unbind(Test2.config.bindAs);
binder.unbind(Test3.config.bindAs);
binder.bind(new Test3(), Test3.config);
binder.unbind(Test2.config.bindAs);
binder.unbind(Test3.config.bindAs);

console.log([11111111]);
binder.bind(new Test3(), Test3.config);
binder.bind(new Test2(), Test2.config);
binder.unbind(Test3.config.bindAs);
//binder.unbind(Test2.config.bindAs);





setTimeout(()=>{
  console.log(['binder', binder]);
});

