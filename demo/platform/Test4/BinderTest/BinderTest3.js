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
      [StoreName.Test2, 'onBind'],
    ],
    onUnbind: [
      [StoreName.Test2, 'onUnbind'],
    ],
  };
  onBind(...arg) {
    console.log(['Test1 onBind', arg]);
  }
  onUnbind(...arg) {
    console.log(['Test1 onUnbind', arg]);
  }
}

class Test2 {
  static config = {
    bindAs: StoreName.Test2,
  };
}

class Test3 {
  static config = {
    bindAs: StoreName.Test3,
  };
}


binder.bind(new Test1(), Test1.config);
binder.bind(new Test2(), Test2.config);
binder.unbind(Test1.config.bindAs);


console.log([1]);
setTimeout(()=>{
  console.log([11, binder.isBind(Test1.config.bindAs)]);

});
setTimeout(()=>{
  console.log([2, binder.isBind(Test1.config.bindAs)]);
  binder.unbind(Test2.config.bindAs);
});

setTimeout(()=>{
  console.log([3]);
  binder.bind(new Test2(), Test2.config);
});
setTimeout(()=>{
  console.log([4]);
  binder.unbind(Test2.config.bindAs);
});
setTimeout(()=>{
  console.log([5]);
  binder.bind(new Test2(), Test2.config);
});
