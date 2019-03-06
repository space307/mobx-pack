import { isEmpty, each, cloneDeep, includes } from 'lodash';
import { toJS } from 'mobx';
import { protoName } from './helper/util';
import EventEmitter from './helper/EventEmitter.js';

const EMITTER_EVENT = {
  BIND: 'BIND',
  UNBIND: 'UNBIND',
};


const CALLBACK_NAME = {
  BIND: 'onBind',
  UNBIND: 'onUnbind',
};

class Binder {
  stores = {};
  callbackResolvers = {
    [CALLBACK_NAME.BIND]: {},
    [CALLBACK_NAME.UNBIND]: {},
  };

  depsList = {
    [CALLBACK_NAME.BIND]: {},
    [CALLBACK_NAME.UNBIND]: {},
  };
  parentBinder: Binder;

  emitter:EventEmitter = new EventEmitter();

  constructor(parentBinder) {
    if (parentBinder instanceof Binder) {
      this.parentBinder = parentBinder;
      each(parentBinder.stores, ({ store, options }) => {
        this.addStore(store, options);
      });

      parentBinder.emitter.subscribe(EMITTER_EVENT.BIND, ({ store, options }) => {
        this.bind(store, options);
      });

      parentBinder.emitter.subscribe(EMITTER_EVENT.UNBIND, (bindAs) => {
        this.unbind(bindAs);
      });
    }
  }

  bind(store, options) {
    const { bindAs } = options;

    if (typeof bindAs !== 'string' || !bindAs.length) {
      this.showMessage(`Store "${protoName(store)}" has not valid "bindAs" id "${bindAs}".`, 'error');
      return;
    }

    if (this.isBind(bindAs)) {
      this.showMessage(`Store "${bindAs}" was already bind.`, 'error');
      return;
    }

    this.addStore(store, options);

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" bind.`);
    }

    /* -- Legacy -- */
    each(this.stores, (item) => {
      if (item) {
        this.processStore(item, this.getStoreSettings(bindAs));
        this.processStore(this.getStoreSettings(bindAs), item);
      }
    });
    /* --/ Legacy -- */


    this.handleOnUnbind(bindAs);
    this.handleOnBind(bindAs);
    this.resolveCallbackPromises(bindAs, CALLBACK_NAME.BIND);
    this.saveDeps(bindAs, CALLBACK_NAME.BIND);
    this.saveDeps(bindAs, CALLBACK_NAME.UNBIND);
    this.emitter.emit(EMITTER_EVENT.BIND, { store, options });
  }

  addStore(store, options) {
    const { bindAs } = options;

    this.stores[bindAs] = {
      bindAs,
      store,
      options: cloneDeep(options),
      disposers: {
        list: [],
        services: {},
      },
    };
  }

  handleOnBind(bindAs) {
    this.handleCallbackList(bindAs, CALLBACK_NAME.BIND);
  }

  handleOnUnbind(bindAs) {
    this.handleCallbackList(bindAs, CALLBACK_NAME.UNBIND);
  }

  /*  getBindStoreAsync(bindAs) {
    return this.getStoreAsyncBehavior(bindAs, this.storeBindWaiter);
  }

  getBindStoreListAsync(storeList) {
    return this.getStoreListAsyncBehavior(storeList, this.storeBindWaiter);
  }

  getUnbindStoreAsync(bindAs) {
    return this.getStoreAsyncBehavior(bindAs, this.storeUnbindWaiter);
  }

  getUnbindStoreListAsync(storeList) {
    return this.getStoreListAsyncBehavior(storeList, this.storeUnbindWaiter);
  } */

  isBindOnParent(bindAs) {
    return this.parentBinder && this.parentBinder.isBind(bindAs);
  }

  destructCallback(list) {
    const len = list && list.length;
    const depsCb = len && list[len - 1];
    const storeList = len && list.slice(0, len - 1);

    return {
      storeList,
      depsCb,
    };
  }

  handleCallbackList(bindAs, callbackName, checkResolve = true) {
    if (this.isBindOnParent(bindAs)) {
      return;
    }
    const settings = this.getStoreSettings(bindAs);
    const store = settings.store;
    const deps = settings.options && settings.options[callbackName];

    if (deps && deps.length && store) {
      deps.forEach((list) => {
        this.handleCallback(bindAs, list, store, callbackName, checkResolve, true);
      });
    }
  }

  handleCallback(bindAs, list, store, callbackName, checkResolve, immediateResolve) {
    const { depsCb, storeList } = this.destructCallback(list);
    this.getStoreListAsyncBehavior(storeList, callbackName, immediateResolve).then((stores) => {
      if (this.isBind(bindAs)) {
        if (typeof depsCb === 'function') {
          depsCb.apply(store, stores);
        } else if (typeof store[depsCb] === 'function') {
          store[depsCb](...stores);
        } else {
          this.showMessage(`${callbackName} method ${depsCb} not found in "${bindAs}".`, 'error');
        }

        this.handleCallback(bindAs, list, store, callbackName, checkResolve, false);
      }
    });

    // This timeout is to check if some store required in "onBind/onUnbind" callback is not resolved
    if (checkResolve) {
      setTimeout(() => {
        const pendingStores = this.getPendingStores(storeList, callbackName);
        if (pendingStores.length && pendingStores.length < storeList.length) {
          // eslint-disable-next-line max-len
          console.warn(`"${bindAs}.${typeof depsCb === 'string' ? depsCb : callbackName}" not called, because "${pendingStores.join(',')}" still not resolved.`);
        }
      }, 5000);
    }
  }

  getStoreListAsyncBehavior(storeList, callbackName, immediateResolve) {
    return Promise.all(storeList.map(bindAsParam =>
      this.getStoreAsyncBehavior(bindAsParam, callbackName, immediateResolve)));
  }

  getStoreAsyncBehavior(bindAs, callbackName, immediateResolve) {
    const resolvers = this.callbackResolvers[callbackName];
    return new Promise((resolve) => {
      if (this.isBind(bindAs) && callbackName === CALLBACK_NAME.BIND && immediateResolve) {
        resolve(this.getStore(bindAs));
      } else {
        if (!resolvers[bindAs]) {
          resolvers[bindAs] = [];
        }
        resolvers[bindAs].push(resolve);
      }
    });
  }

  getPendingStores(storeList, callbackName) {
    const result = [];
    const resolvers = this.callbackResolvers[callbackName];
    storeList.forEach((storeName) => {
      if (resolvers[storeName] && resolvers[storeName].length) {
        result.push(storeName);
      }
    });

    return result;
  }


  isBind(bindAs) {
    return !!(this.stores[bindAs] && this.stores[bindAs].store);
  }

  getStoreSettings(bindAs) {
    return this.stores[bindAs] || {};
  }

  saveDeps(bindAs, callbackName) {
    if (this.isBindOnParent(bindAs)) {
      return;
    }

    const settings = this.getStoreSettings(bindAs);
    const deps = settings.options && settings.options[callbackName];

    if (deps && deps.length) {
      deps.forEach((list) => {
        const len = list && list.length;
        list.forEach((item, i) => {
          if (i < len - 1) {
            if (!this.depsList[callbackName][item]) {
              this.depsList[callbackName][item] = [];
            }
            if (!includes(this.depsList[callbackName][item], bindAs)) {
              this.depsList[callbackName][item].push(bindAs);
            }
          }
        });
      });
    }
  }

  unbind(bindAs) {
    const storeSettings = this.getStoreSettings(bindAs);

    if (!this.isBind(bindAs)) {
      this.showMessage(`Not bind store "${bindAs}" try to unbind!`, 'warn');
      return;
    }

    /* -- Legacy -- */
    // unbind data exporting to other stores
    each(this.stores, (item) => {
      if (item) {
        const importData = item.options.importData && item.options.importData[bindAs];
        if (importData) {
          // console.log(['unbind data exporting to other stores', item.bindAs, importData]);
          this.unbindData(item.bindAs, importData);
        }
      }
    });

    // unbind data importing from other stores
    if (storeSettings.options.importData) {
      each(storeSettings.options.importData, (importData) => {
        this.unbindData(bindAs, importData);
      });
    }

    // unbind disposers in this store
    storeSettings.disposers.list.forEach((disposer) => {
      if (typeof disposer === 'function') {
        disposer();
      }
    });
    // unbind disposers in other stores
    this.unbindDisposers(bindAs);
    /* --/ Legacy -- */

    this.resolveCallbackPromises(bindAs, CALLBACK_NAME.UNBIND);


    // clear store settings in binder
    this.stores[bindAs] = undefined;

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" unbind.`);
    }

    this.emitter.emit(EMITTER_EVENT.UNBIND, bindAs);
  }

  getStore(bindAs) {
    return this.getStoreSettings(bindAs).store;
  }

  resolveCallbackPromises(bindAs, callbackName) {
    if (!this.isBind(bindAs)) {
      return;
    }

    const resolvers = this.callbackResolvers[callbackName];
    const resolversList = resolvers[bindAs];

    if (resolversList) {
      resolversList.forEach((resolve) => {
        resolve(this.getStore(bindAs));
      });

      resolvers[bindAs] = [];
    }
  }

  isDebug(bindAs) {
    const s = this.getStoreSettings(bindAs);
    return s && s.options ? s.options.debug : false;
  }

  clear() {
    this.stores = {};
    this.callbackResolvers = {
      [CALLBACK_NAME.BIND]: {},
      [CALLBACK_NAME.UNBIND]: {},
    };
    this.depsList = {
      [CALLBACK_NAME.BIND]: {},
      [CALLBACK_NAME.UNBIND]: {},
    };
    this.emitter.clear();
  }

  showMessage(msg, type = 'info') {
    if (type === 'info') {
      console.log(`Binder. ${msg}`);
    } else if (type === 'warn') {
      console.warn(`Binder. ${msg}`);
    } else if (type === 'error') {
      console.error(`Binder. ${msg}`);
    }
  }

  /* -- Legacy -- */
  processStore(from, to) {
    if (from.bindAs !== to.bindAs) {
      const { importData } = to.options;

      if (importData && importData[from.bindAs]) {
        each(importData[from.bindAs], (toVarName, fromVarName) => {
          if (!(fromVarName in from.store)) {
            this.showMessage(`Variable "${fromVarName}" required for "${to.bindAs}" 
            not found in "${from.bindAs}"`, 'warn');
            return;
          }

          if (toVarName in to.store) {
            this.showMessage(`Trying create link from "${from.bindAs}.${fromVarName}" 
            to "${to.bindAs}.${toVarName}", but variable "${toVarName}" is already exist in "${to.bindAs}"`, 'warn');
            return;
          }

          Object.defineProperty(to.store, toVarName, {
            get: () => {
              if (this.isDebug(to.bindAs)) {
                this.showMessage(`Variable "${fromVarName}" from "${from.bindAs}" 
              was taken by "${to.bindAs}" with name "${toVarName}"`);
              }

              return from.store[fromVarName];
            },
            configurable: true,
          });
        });
      }
    }
  }

  addDisposer(bindAs, services, obsr) {
    const storeSettings = this.getStoreSettings(bindAs);
    let pass = true;

    services.forEach((serviceName) => {
      if (!this.isBind(serviceName)) {
        this.showMessage(`Impossible add disposer for not bind service "${bindAs}".`, 'warn');
        pass = false;
      }
    });

    if (pass) {
      storeSettings.disposers.list.push(obsr);

      services.forEach((serviceName) => {
        if (!storeSettings.disposers.services[serviceName]) {
          storeSettings.disposers.services[serviceName] = [];
        }

        storeSettings.disposers.services[serviceName].push(storeSettings.disposers.list.length - 1);
      });
    }

    return pass;
  }

  unbindDisposers(bindAs) {
    each(this.stores, (store) => {
      if (store && store.disposers.services[bindAs]) {
        store.disposers.services[bindAs].forEach((disposer) => {
          if (typeof store.disposers.list[disposer] === 'function') {
            store.disposers.list[disposer]();
            store.disposers.list[disposer] = undefined;
          }
        });
      }
    });
  }

  unbindData(bindAs, importData) {
    const { store } = this.getStoreSettings(bindAs);
    each(importData, (toVarName) => {
      if (toVarName in store) {
        Object.defineProperty(store, toVarName, { value: undefined });
      }
    });
  }

  /**
   * Отдаёт значение переменной из стора, привязанного к биндеру
   * @public
   * @param {string} storeName
   * @param {string} varName
   * @param {string} initiator
   * @param {boolean} raw
   * @returns {mixed}
   */

  importVar(storeName, varName, initiator, raw) {
    const s = this.getStoreSettings(storeName);
    const store = s && s.store ? s.store : null;
    let val;
    let exportData;

    if (s && s.store) {
      exportData = s.options.exportData;

      if (exportData && !exportData[varName]) {
        console.warn(`Warnning! Impossible import variable "${varName}" of 
        "${s.bindAs}" for "${initiator}" because variable is not included to config.exportData.`);
        return;
      }

      val = store[varName];
      if (s.debug) {
        console.log(`Binder. "${initiator}" import variable "${varName}" from "${storeName}".`, val);
      }
      return raw ? val : toJS(val); // eslint-disable-line
    }

    console.warn(`Warnning! importVar form "${protoName(this)}" to "${initiator}". "${storeName}" store not found.`);

    return undefined; // eslint-disable-line
  }

  /**
   * Вызвает метод описанный в api стора с параметрами
   * @public
   * @param {string} storeName
   * @param {string} actionName
   * @param {string} initiator
   * @param {array} arg
   */
  callApi(storeName, actionName, initiator, ...arg) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const s = this.getStoreSettings(storeName);
    let storeInst;

    if (s && s.store) {
      storeInst = s.store;

      if (s.options.debug) {
        console.log(`Binder callApi. "${initiator}" calls method "${actionName}" from "${storeName}".`, arg);
      }

      if (storeInst.api && storeInst.api[actionName]) {
        return storeInst.api[actionName].apply(storeInst, arg); // eslint-disable-line
      }
      console.warn(`CallApi warn. "${initiator}" calls unknown method "${actionName}" found in store "${storeName}".`);
    } else {
      console.warn(`CallApi warn. "${initiator}" calls method "${actionName}" from not bind store "${storeName}".`);
    }
  }
  /* --/ Legacy -- */
}

export default Binder;
