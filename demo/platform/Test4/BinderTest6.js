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

const t1 = 't1';
const t2 = 't2';
const t3 = 't3';
const t4 = 't4';
const t5 = 't5';
const t6 = 't6';

class Test1 {
  static config = {
    bindAs: t1,
    onBind: [
      [t3, t4, t5, 'someMethod'],
      [t2, 'someMethod'],
    ],
    onUnbind: [
      [t2, 'someMethod'],
      [t1, t2, 'someMethod'],
    ],
  };

   someMethod(){}
}

class Test2 {
  static config = {
    bindAs: t2,
    onBind: [
      [t3, t6, 'someMethod'],
      [t5, 'someMethod'],
    ],
  };
  someMethod(){}
}
class Test3 {
  static config = {
    bindAs: t3,
    onUnbind: [
      [t4, t5, 'someMethod'],
      [t2, 'someMethod'],
      [t1, 'someMethod'],
    ],
  };
  someMethod(){}

}
class Test4 {
  static config = {
    bindAs: t4,
  };
  someMethod(){}
}
class Test5 {
  static config = {
    bindAs: t5,
    onBind: [
      [t1, t6, 'someMethod'],

    ],
  };
  someMethod(){}
}
class Test6 {
  static config = {
    bindAs: t6,
  };
  someMethod(){}
}
binder.emitter.subscribe('CALLBACK_CALLED', ({ bindAs, callbackType, callback, storeList })=>{
  console.log([bindAs, callbackType, storeList.join(',')]);
});


binder.bind(new Test1(), Test1.config);
binder.bind(new Test2(), Test2.config);
binder.bind(new Test3(), Test3.config);
binder.bind(new Test4(), Test4.config);
binder.bind(new Test5(), Test5.config);


//binder.unbind(t4);
//binder.bind(new Test4(), Test4.config);

//binder.unbind(t3);
/*binder.unbind(t4);
binder.unbind(t5);*/

binder.bind(new Test6(), Test6.config);






setTimeout(()=>{
  console.log(['binder', binder]);
});

