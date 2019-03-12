/* eslint-disable method-can-be-static, class-methods-use-this, no-console */
import { each, cloneDeep, includes } from 'lodash';
import { toJS } from 'mobx';
import { protoName } from './helper/util';
import EventEmitter from './helper/EventEmitter.js';

/*
Аглоритм работы биндера
bind:
- сохраняем deps [dependency] : [waiter]
- проходим по всем зависимостям onBind и выполняем их (зависимости других сервисов от текущего,
  а также из списка зависимости текущего сервиса).
  Если колбек не locked и все сервисы isBind выполняем onBind и ставим locked на onBind.
- проходим по всем зависимостям onUnbind и выполняем их (зависимости других сервисов от текущего,
  а также из списка зависимости текущего сервиса).
  Если колбек не locked и все сервисы isBind выполняем onBind и ставим locked на onBind.
  Если все сервисы в колбеке isBind - делаем колбек unlocked.

unbind:
 - проходим по колбекам onBind если !isBind на всех сервисах и onBind.locked === true ставим onBind.locked = true
 - проходим по колбекам onUnbind если onUnbind.locked === true выполняем onUnbind и ставим onUnbind.locked = false
 */

const EMITTER_EVENT = {
  BIND: 'BIND',
  UNBIND: 'UNBIND',
  CALLBACK_CALLED: 'CALLBACK_CALLED',
};


const CALLBACK_NAME = {
  BIND: 'onBind',
  UNBIND: 'onUnbind',
};

const MESSAGE_TYPES = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
};

class Binder {
  stores = {};

  depsList = {
    [CALLBACK_NAME.BIND]: {},
    [CALLBACK_NAME.UNBIND]: {},
  };
  parentBinder: Binder;

  emitter:EventEmitter = new EventEmitter();

  allowParentOperation = false;

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
        this.allowParentOperation = true;
        this.unbind(bindAs);
        this.allowParentOperation = false;
      });
    }
  }

  bind(store, options) {
    if (!options) {
      throw new Error('Binder options is not valid');
    }

    const { bindAs } = options;


    if (typeof bindAs !== 'string' || !bindAs.length) {
      throw new Error(`Store "${protoName(store)}" has not valid "bindAs" id "${bindAs}".`);
    }

    this.validateCallback(options, CALLBACK_NAME.BIND);
    this.validateCallback(options, CALLBACK_NAME.UNBIND);

    if (this.isBind(bindAs)) {
      throw new Error(`Store "${bindAs}" was already bind.`);
    }

    if (typeof store !== 'object') {
      throw new Error(`Store bind param is not an object ("${bindAs}").`);
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

    // сохраняем OnBind зависимости текущего сервиса
    this.saveDeps(bindAs, CALLBACK_NAME.BIND);
    // сохраняем OnUnbind зависимости текущего сервиса
    this.saveDeps(bindAs, CALLBACK_NAME.UNBIND);
    // проверяем и выполняем зависимости на событие OnBind
    this.handleOnBind(bindAs);

    this.emitter.emit(EMITTER_EVENT.BIND, { store, options });
  }

  addStore(store, options) {
    const { bindAs } = options;

    const optionsCopy = cloneDeep(options);

    if (optionsCopy.onUnbind) {
      optionsCopy.onUnbind.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.__locked = true;
      });
    }

    this.stores[bindAs] = {
      bindAs,
      store,
      options: optionsCopy,
      disposers: {
        list: [],
        services: {},
      },
    };
  }

  handleOnBind(bindAs) {
    const settings = this.getStoreSettings(bindAs);
    const onBindCallbackSetList = settings.options && settings.options[CALLBACK_NAME.BIND];
    const onUnbindCallbackSetList = settings.options && settings.options[CALLBACK_NAME.UNBIND];
    // проверяем и выполняем OnBind зависимости других сервисов от текущего сервиса
    this.handleOnBindItem(bindAs);
    // проверяем и выполняем OnUnbind зависимости других сервисов от текущего сервиса
    this.handleOnUnbindItem(bindAs);
    // проверяем и выполняем OnBind зависимости из списка зависимостей текущего сервиса
    this.lookOverCallback(onBindCallbackSetList, (serviceName) => {
      this.handleOnBindItem(serviceName);
    });
    // проверяем и выполняем OnUnbind зависимости из списка зависимостей текущего сервиса
    this.lookOverCallback(onUnbindCallbackSetList, (serviceName) => {
      this.handleOnUnbindItem(serviceName);
    });
  }

  lookOverCallback(callbackSetList, cb) {
    if (callbackSetList) {
      callbackSetList.forEach((callbackSet) => {
        const len = callbackSet.length;

        callbackSet.forEach((serviceName, i) => {
          if (i < len - 1) {
            cb(serviceName);
          }
        });
      });
    }
  }

  handleOnBindItem(bindAs) {
    this.lookOverDeps(bindAs, CALLBACK_NAME.BIND, (depBindAs, callbackSet, store) => {
      const {
        callback,
        storeList,
      } = this.destructCallback(callbackSet);

      if (!callbackSet.__locked && this.isListBind(storeList)) {
        this.applyCallback(depBindAs, callbackSet, storeList, callback, store, CALLBACK_NAME.BIND);
      } else {
        this.checkCallBackResolved(depBindAs, callbackSet, storeList);
      }
    });
  }
  checkCallBackResolved(bindAs, callbackSet, storeList) {
    if (callbackSet.__resolveTM) {
      clearTimeout(callbackSet.__resolveTM);
    }
    callbackSet.__resolveTM = setTimeout(() => {
      const notBind = this.getNotBind(storeList);
      const cbName = callbackSet[callbackSet.length - 1];

      if (notBind.length && notBind.length < storeList.length) {
        this.showMessage(`"${bindAs}.${typeof cbName === 'string' ? cbName : CALLBACK_NAME.BIND}" 
        not called, because "${notBind.join(',')}" still not resolved.`, MESSAGE_TYPES.WARN);
      }
      delete callbackSet.__resolveTM;
    }, 1000);
  }

  handleOnUnbindItem(bindAs) {
    this.lookOverDeps(bindAs, CALLBACK_NAME.UNBIND, (depBindAs, callbackSet) => {
      const {
        storeList,
      } = this.destructCallback(callbackSet);

      if (this.isListBind(storeList) && callbackSet.__locked) {
        // eslint-disable-next-line no-param-reassign
        delete callbackSet.__locked;
      }
    });
  }

  handleOnUnbind(bindAs) {
    this.lookOverDeps(bindAs, CALLBACK_NAME.BIND, (depBindAs, callbackSet) => {
      const {
        storeList,
      } = this.destructCallback(callbackSet);

      if (callbackSet.__locked && this.isListUnBind(storeList)) {
        // eslint-disable-next-line no-param-reassign
        delete callbackSet.__locked;
      }
    });

    this.lookOverDeps(bindAs, CALLBACK_NAME.UNBIND, (depBindAs, callbackSet, store) => {
      const {
        callback,
        storeList,
      } = this.destructCallback(callbackSet);

      if (!callbackSet.__locked && this.isListUnBind(storeList)) {
        this.applyCallback(depBindAs, callbackSet, storeList, callback, store, CALLBACK_NAME.UNBIND);
      }
    });
  }

  applyCallback(bindAs, callbackSet, storeList, callback, store, callbackType) {
    const funcToCall = this.parseCallback(callback, store);

    if (funcToCall) {
      funcToCall.apply(store, callbackType === CALLBACK_NAME.BIND ? this.getStoreList(storeList) : []);

      // eslint-disable-next-line no-param-reassign
      callbackSet.__locked = true;
      this.emitter.emit(EMITTER_EVENT.CALLBACK_CALLED, { bindAs, callbackType, callback, storeList });
    } else {
      throw new Error(`${callbackType} method ${callback} not found in "${bindAs}".`);
    }
  }

  getStoreList(storeList) {
    return storeList.reduce((acc, bindAs) => {
      const store = this.getStore(bindAs);
      if (store) {
        acc.push(store);
      }
      return acc;
    }, []);
  }

  lookOverDeps(bindAs, callbackType, cb) {
    const list = this.depsList[callbackType][bindAs];

    if (list && list.length) {
      list.forEach((depBindAs) => {
        const settings = this.getStoreSettings(depBindAs);
        const callbackSetList = settings.options && settings.options[callbackType];
        const store = this.getStore(depBindAs);

        if (callbackSetList) {
          callbackSetList.forEach((callbackSet) => {
            if (includes(callbackSet, bindAs)) {
              cb(depBindAs, callbackSet, store);
            }
          });
        }
      });
    }
  }

  validateCallback(options, callbackName) {
    const { bindAs } = options;

    const list = options[callbackName];
    if (list && list.length) {
      if (!Array.isArray(list[0])) {
        throw new Error(`Store "${bindAs}" ${callbackName} should contains 
        Array on callback data"`);
      } else {
        this.lookOverCallback(list, (serviceName) => {
          if (bindAs === serviceName) {
            throw new Error(`Store "${bindAs}" ${callbackName} callback contains 
          the same name as store name "${bindAs}"`);
          }
        });

        list.forEach((callback) => {
          if (callback.length < 2) {
            throw new Error(`Store "${bindAs}" ${callbackName} should contains 
        Array this at least 2 items, but ${callback.length} given [${callback.join(',')}]."`);
          }
        });
      }
    }
  }

  parseCallback(callback, store) {
    if (typeof callback === 'function') {
      return callback;
    } else if (typeof store[callback] === 'function') {
      return store[callback];
    }
    return null;
  }

  isListBind(list) {
    return list.reduce((acc, bindAs) => {
      if (!this.isBind(bindAs)) {
        // eslint-disable-next-line no-param-reassign
        acc = false;
      }
      return acc;
    }, true);
  }

  getNotBind(list) {
    return list.reduce((acc, bindAs) => {
      if (!this.isBind(bindAs)) {
        acc.push(bindAs);
      }
      return acc;
    }, []);
  }

  isListUnBind(list) {
    return list.reduce((acc, bindAs) => {
      if (this.isBind(bindAs)) {
        // eslint-disable-next-line no-param-reassign
        acc = false;
      }
      return acc;
    }, true);
  }

  isBindOnParent(bindAs) {
    return !!(this.parentBinder && this.parentBinder.isBind(bindAs));
  }

  destructCallback(list) {
    const len = list && list.length;
    const callback = len && list[len - 1];
    const storeList = len && list.slice(0, len - 1);

    return {
      storeList,
      callback,
    };
  }

  isBind(bindAs) {
    return !!(this.stores[bindAs] && this.stores[bindAs].store);
  }

  getStoreSettings(bindAs) {
    return this.stores[bindAs] || {};
  }

  saveDeps(bindAs, callbackType) {
    if (this.isBindOnParent(bindAs)) {
      return;
    }

    const settings = this.getStoreSettings(bindAs);
    const deps = settings.options && settings.options[callbackType];

    if (deps && deps.length) {
      deps.forEach((list) => {
        const len = list && list.length;
        list.forEach((item, i) => {
          if (i < len - 1) {
            if (!this.depsList[callbackType][item]) {
              this.depsList[callbackType][item] = [];
            }
            if (!includes(this.depsList[callbackType][item], bindAs)) {
              this.depsList[callbackType][item].push(bindAs);
            }
          }
        });
      });
    }
  }

  unbind(bindAs) {
    const storeSettings = this.getStoreSettings(bindAs);

    if (!this.isBind(bindAs)) {
      this.showMessage(`Not bind store "${bindAs}" try to unbind!`, MESSAGE_TYPES.WARN);
      return;
    }

    if (this.isBindOnParent(bindAs) && !this.allowParentOperation) {
      throw new Error(`Try to unbind store "${bindAs}" from parent Binder.`);
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

    // clear store settings in binder
    this.stores[bindAs] = undefined;

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" unbind.`);
    }
    // проверяем и выполняем зависимости на событие OnUnbind
    this.handleOnUnbind(bindAs);
    this.emitter.emit(EMITTER_EVENT.UNBIND, bindAs);
  }

  getStore(bindAs) {
    return this.getStoreSettings(bindAs).store;
  }

  isDebug(bindAs) {
    const s = this.getStoreSettings(bindAs);
    return s && s.options ? s.options.debug : false;
  }

  clear() {
    this.stores = {};
    this.depsList = {
      [CALLBACK_NAME.BIND]: {},
      [CALLBACK_NAME.UNBIND]: {},
    };
    this.emitter.clear();
  }

  showMessage(msg, type = 'info') {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (type === MESSAGE_TYPES.INFO) {
      console.log(`Binder. ${msg}`);
    } else if (type === MESSAGE_TYPES.WARN) {
      console.warn(`Binder. ${msg}`);
    } else if (type === MESSAGE_TYPES.ERROR) {
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
            not found in "${from.bindAs}"`, MESSAGE_TYPES.WARN);
            return;
          }

          if (toVarName in to.store) {
            this.showMessage(`Trying create link from "${from.bindAs}.${fromVarName}" 
            to "${to.bindAs}.${toVarName}", but variable "${toVarName}" is already exist in "${to.bindAs}"`,
            MESSAGE_TYPES.WARN);
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
        this.showMessage(`Impossible add disposer for not bind service "${bindAs}".`, MESSAGE_TYPES.WARN);
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
            // eslint-disable-next-line no-param-reassign
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
