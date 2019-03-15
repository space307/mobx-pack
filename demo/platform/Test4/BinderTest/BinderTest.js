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
    onUnbind: [[StoreName.Test1, 'onUnbind']],
  };

  onBind(...arg) {
    console.log(['Test5 onBind', arg]);
  }
  onUnbind(...arg) {
    console.log(['Test5 onUnbind', arg]);
  }
}


class Test1Local {
  static config = {
    bindAs: StoreName.Test1Local,
    onBind: [[StoreName.Test2, StoreName.Test2Local, 'onBind']],
  };
  onBind(...arg) {
    console.log(['Test1Local onBind', arg]);
  }
}

class Test2Local {
  static config = {
    bindAs: StoreName.Test2Local,
    onBind: [[StoreName.Test1, StoreName.Test1Local, 'onBind']],
    onUnbind: [[StoreName.Test1, 'onUnbind']],
  };
  onBind(...arg) {
    console.log(['Test2Local onBind', arg]);
  }
  onUnbind(...arg) {
    console.log(['Test2Local onUnbind', arg]);
  }
}

// binder.bind(new Test4(), Test4.config);
binder.bind(new Test1(), Test1.config);
binder.bind(new Test2(), Test2.config);
binder.bind(new Test3(), Test3.config);
binder.bind(new Test5(), Test5.config);
binder.bind(new Test4(), Test4.config);

binderLocal.bind(new Test1Local(), Test1Local.config);
binderLocal.bind(new Test2Local(), Test2Local.config);


setTimeout(() => {
  console.log(['setTimeout']);
  binder.unbind(Test1.config.bindAs);
}, 1000);