import { isEmpty, each, cloneDeep } from 'lodash';
import { toJS } from 'mobx';
import { protoName } from './util';
import EventEmitter from './helper/EventEmitter.js';

const EMITTER_EVENT = {
  BIND: 'BIND',
  UNBIND: 'UNBIND',
};


class Binder {
  stores = {};
  storeBindWaiter = {};
  emitter:EventEmitter = new EventEmitter();

  constructor(parentEmitter) {
    if (parentEmitter instanceof EventEmitter) {
      parentEmitter.subscribe(EMITTER_EVENT.BIND, ({ store, options }) => {
        this.bind(store, options);
      });

      parentEmitter.subscribe(EMITTER_EVENT.UNBIND, (bindAs) => {
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
      this.showMessage(`Store "${bindAs}" was already bind.`, 'warn');
      return;
    }

    this.addStore(store, options);

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" bind.`);
    }

    each(this.stores, (item) => {
      if (item) {
        this.processStore(item, this.getStoreSettings(bindAs));
        this.processStore(this.getStoreSettings(bindAs), item);
      }
    });

    this.notifyOnBind(bindAs);
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

  clear() {
    this.stores = {};
    this.storeBindWaiter = {};
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

  notifyOnBind(bindAs) {
    const settings = this.getStoreSettings(bindAs);
    const store = settings.store;
    const onBind = settings.options && settings.options.onBind;

    if (onBind && onBind.length && store) {
      onBind.forEach((list) => {
        const len = list && list.length;
        const onBindCb = len && list[len - 1];
        const storeList = len && list.slice(0, len - 1);

        this.getStoreListAsync(storeList).then((stores) => {
          if (typeof onBindCb === 'function') {
            onBindCb.apply(store, stores);
          } else {
            store[onBindCb](...stores);
          }
        });

        // This timeout is to check if some store required in "onBind" callback is not resolved
        setTimeout(() => {
          const pendingStores = this.getPendingStores(storeList);
          if (pendingStores.length && pendingStores.length < storeList.length) {
            // eslint-disable-next-line max-len
            console.warn(`"${bindAs}.${typeof onBindCb === 'string' ? onBindCb : 'onBind'}" not called, because "${pendingStores.join(',')}" still not resolved.`);
          }
        }, 5000);
      });
    }

    this.resolveWaiterPromises(bindAs);
  }

  getPendingStores(storeList) {
    const result = [];
    storeList.forEach((storeName) => {
      if (this.storeBindWaiter[storeName] && this.storeBindWaiter[storeName].length) {
        result.push(storeName);
      }
    });

    return result;
  }

  isDebug(bindAs) {
    const s = this.getStoreSettings(bindAs);
    return s && s.options ? s.options.debug : false;
  }

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

  isBind(bindAs) {
    return !!(this.stores[bindAs] && this.stores[bindAs].store);
  }

  getStoreSettings(bindAs) {
    return this.stores[bindAs] || {};
  }

  unbind(bindAs) {
    const storeSettings = this.getStoreSettings(bindAs);

    if (isEmpty(storeSettings)) {
      this.showMessage(`Not bind store "${bindAs}" try to unbind!`, 'warn');
      return;
    }

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

    // clear store settings in binder
    this.stores[bindAs] = undefined;

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" unbind.`);
    }

    this.emitter.emit(EMITTER_EVENT.UNBIND, bindAs);
  }

  unbindData(bindAs, importData) {
    const { store } = this.getStoreSettings(bindAs);
    each(importData, (toVarName) => {
      if (toVarName in store) {
        Object.defineProperty(store, toVarName, { value: undefined });
      }
    });
  }


  getStoreAsync(bindAs) {
    return new Promise((resolve) => {
      if (this.isBind(bindAs)) {
        resolve(this.getStore(bindAs));
      } else {
        if (!this.storeBindWaiter[bindAs]) {
          this.storeBindWaiter[bindAs] = [];
        }
        this.storeBindWaiter[bindAs].push(resolve);
      }
    });
  }

  getStoreListAsync(storeList) {
    return Promise.all(storeList.map(bindAsParam => this.getStoreAsync(bindAsParam)));
  }


  getStore(bindAs) {
    return this.getStoreSettings(bindAs).store;
  }

  resolveWaiterPromises(bindAs) {
    if (!this.isBind(bindAs)) {
      return;
    }

    const waiters = this.storeBindWaiter[bindAs];

    if (waiters) {
      waiters.forEach((resolve) => {
        resolve(this.getStore(bindAs));
      });

      this.storeBindWaiter[bindAs] = [];
    }
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
}

export default Binder;
