/* eslint-disable */
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
      [t2, t3, 'someMethod1'],
      [t3, t2, 'someMethod2'],
    ],
    onUnbind: [
      [t2, 'someMethod'],
      [t2, t3, 'someMethod'],
    ],
  };

   someMethod1(...arg){
     console.log(['someMethod1', arg]);

   }
  someMethod2(...arg){
    console.log(['someMethod2', arg]);
   }
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
  someMethod(){}
}
class Test3 {
  static config = {
    bindAs: t3,
    onBind: [
      [t2, 'someMethod'],
    ],
    onUnbind: [
      [t2, t1,'someMethod'],
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
      [t3, 'someMethod'],
      [t4, t2, 'someMethod'],
      [t1, t2, 'someMethod'],
    ],
    onUnbind: [
      [t1, t4, 'someMethod'],
    ],
  };
  someMethod(){}
}
class Test6 {
  static config = {
    bindAs: t6,
    onBind: [
      [t4, t1, 'someMethod'],
    ],
    onUnbind: [
      [t1, 'someMethod'],
      [t4, t1, t3, t2, 'someMethod'],
    ],
  };

  someMethod(){}
}

const hash = {
  '1':Test1,
  '2':Test2,
  '3':Test3,
  '4':Test4,
  '5':Test5,
  '6':Test6,
};

function g(num){
  binder.bind(new hash[num](), hash[num].config);
}
function _g(num){
  binder.unbind('t'+num);
}
function l(num){
  binderLocal.bind(new hash[num](), hash[num].config);
}
function _l(num){
  binderLocal.unbind('t'+num);
}
binder.emitter.subscribe('CALLBACK_CALLED', ({ bindAs, callbackType, callback, storeList })=>{
  console.log([bindAs, callbackType, storeList.join(','), 1]);
});
binderLocal.emitter.subscribe('CALLBACK_CALLED', ({ bindAs, callbackType, callback, storeList })=>{
  console.log([bindAs, callbackType, storeList.join(','), 2]);
});

binder.emitter.subscribe('UNBIND', (data)=>{
// console.log(['UNBIND', data, 1]);
});
/*binderLocal.emitter.subscribe('UNBIND', (data)=>{
  console.log(['UNBIND', data, 2]);
});*/

// 1(2, 3/ 3)-(2 / 2, 3)
// 2(1,3)-(1,3)
// 3(2)-(2,1 / 1)


g(1);
g(2);
g(3);



setTimeout(()=>{
  console.log(['binder', binder]);
  console.log(['binderLocal', binderLocal]);
});

