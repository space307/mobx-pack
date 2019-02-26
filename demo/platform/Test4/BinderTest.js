// @flow
import { Binder } from 'sources.js';


const binder = new Binder();


const StoreName = {
  Test1: 'Test1',
  Test2: 'Test2',
  Test3: 'Test3',
  Test4: 'Test4',
  Test5: 'Test5',
};


class Test1 {
  static config = {
    bindAs: StoreName.Test1,
    onBind: [[StoreName.Test3, StoreName.Test4, StoreName.Test5, 'onBind']],
  };
  onBind(...arg) {
    console.log(['Test1 onBind', arg]);
  }
}

class Test2 {
  static config = {
    bindAs: StoreName.Test2,
    onBind: [[StoreName.Test1, 'onBind']],
  };
  onBind(...arg) {
    console.log(['Test2 onBind', arg]);
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


class Test4 {
  static config = {
    bindAs: StoreName.Test4,
    onBind: [[StoreName.Test2, StoreName.Test3, 'onBind']],
  };

  onBind(...arg) {
    console.log(['Test4 onBind', arg]);
  }
}

class Test5 {
  static config = {
    bindAs: StoreName.Test5,
    onBind: [[StoreName.Test1, StoreName.Test4, 'onBind']],
  };

  onBind(...arg) {
    console.log(['Test5 onBind', arg]);
  }
}

// binder.bind(new Test4(), Test4.config);
binder.bind(new Test1(), Test1.config);
binder.bind(new Test2(), Test2.config);
binder.bind(new Test3(), Test3.config);
binder.bind(new Test5(), Test5.config);
binder.bind(new Test4(), Test4.config);

setTimeout(() => {
  console.log(['binder', binder]);
}, 1000);
