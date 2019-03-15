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
      [StoreName.Test2, StoreName.Test3, 'onBind23'],
      [StoreName.Test3, 'onBind3'],
    ],
    onUnbind: [
      [StoreName.Test3, 'onUnbind3'],
    ],
  };
  onBind23(...arg) {
    console.log(['Test1 onBind23', arg]);
  }
  onBind3(...arg) {
    console.log(['Test1 onBind3', arg]);
  }
  onUnbind3(...arg) {
    console.log(['Test1 onUnbind3', arg]);
  }
}

class Test2 {
  static config = {
    bindAs: StoreName.Test2,
    onBind: [
      [StoreName.Test1, 'onBind1'],
      [StoreName.Test3, 'onBind3'],
    ],
    onUnbind: [
      [StoreName.Test1, 'onUnbind1'],
    ],

  };
  onBind1(...arg) {
    console.log(['Test2 onBind1', arg]);
  }
  onBind3(...arg) {
    console.log(['Test2 onBind3', arg]);
  }
  onUnbind1(...arg) {
    console.log(['Test2 onUnbind1', arg]);
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

class Test1Local {
  static config = {
    bindAs: StoreName.Test1Local,
    onBind: [
      [StoreName.Test2, 'onBind2'],
    ],
    onUnbind: [
      [StoreName.Test3, 'onUnbind3'],
    ],
  };
  onBind2(...arg) {
    console.log(['Test1Local onBind2', arg]);
  }
  onUnbind3(...arg) {
    console.log(['Test1Local onUnbind3', arg]);
  }
}


class Test2Local {
  static config = {
    bindAs: StoreName.Test2Local,
    onBind: [
      [StoreName.Test1Local, StoreName.Test3, 'onBind1Local3'],
    ],
    onUnbind: [
      [StoreName.Test1Local, StoreName.Test3, 'onUnbind1Local3'],
    ],
  };
  onBind1Local3(...arg) {
    console.log(['Test2Local onBind1Local3', arg]);
  }
  onUnbind1Local3(...arg) {
    console.log(['Test2Local onUnbind1Local3', arg]);
  }
}



binder.bind(new Test3(), Test3.config);
binder.bind(new Test1(), Test1.config);

setTimeout(()=>{
  binder.bind(new Test2(), Test2.config);
});



setTimeout(()=>{
  binder.bind(new Test1Local(), Test1Local.config);
});

setTimeout(()=>{
  binder.bind(new Test2Local(), Test2Local.config);
});


setTimeout(()=>{
  console.log([1]);
  binder.unbind(Test2.config.bindAs);
  binder.unbind(Test3.config.bindAs);
});




setTimeout(()=>{
  console.log([2]);
  binder.bind(new Test2(), Test2.config);
  binder.bind(new Test3(), Test3.config);
});
setTimeout(()=>{

});

setTimeout(()=>{
  console.log([3]);
  binder.unbind(Test1Local.config.bindAs);
  binder.unbind(Test3.config.bindAs, 1);



  setTimeout(()=>{
    console.log(['binder', binder]);
  });
}, 6000);




/*
binder.bind(new Test4(), Test4.config);
binder.bind(new Test1(), Test1.config);
binder.unbind(Test1.config.bindAs);

binder.bind(new Test2(), Test2.config);
binder.bind(new Test3(), Test3.config);


binderLocal.bind(new Test1Local(), Test1Local.config);

setTimeout(()=>{
  binder.unbind(Test3.config.bindAs);
}, 1000);

//binder.bind(new Test3(), Test3.config);
*/


/*
setTimeout(() => {
  //console.log(['setTimeout1']);
  binder.unbind(Test3.config.bindAs);


  setTimeout(() => {
    //console.log(['setTimeout2']);
    binder.bind(new Test3(), Test3.config);
  });
});
*/


setTimeout(() => {
  //console.log(['setTimeout', binder, binderLocal]);
  // binder.unbind(Test1.config.bindAs);
}, 1000);
