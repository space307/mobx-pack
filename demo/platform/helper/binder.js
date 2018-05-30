import _ from 'lodash';
import { toJS } from 'mobx';
import { protoName } from './util';

class Binder {
  stores = {};

  bind(store, bindAs, services) {


    if (typeof bindAs !== 'string' || !bindAs.length) {
      this.showMessage(`Store "${protoName(store)}" has not valid "bindAs" id "${bindAs}".`, 'error');
      return;
    }

    if (this.isBinded(bindAs)) {
      this.showMessage(`Store "${bindAs}" was already bind.`, 'warn');
      return;
    }

    this.addStore(store, bindAs, services);

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" bind.`);
    }

    _.each(this.stores, (item) => {
      if (item) {
        this.processStore(item, this.getStore(bindAs));
        this.processStore(this.getStore(bindAs), item);
      }
    });

 /*   _.each(this.stores, (item) => {
      if (item) {
        if (item.bindHash && item.bindHash[bindAs]) {
          this.notifyOnBind(item);
        }
      }
    });*/

    //this.notifyOnBind(this.getStore(bindAs));
  }

  addStore(store, bindAs, services) {
    const config = store.getConfig();

    const bindHash = {};

/*    if (config.onBind) {
      config.onBind.forEach((arr) => {
        arr.forEach((storeName) => {
          if (typeof storeName !== 'function') {
            bindHash[storeName] = 1;
          }
        });
      });
    }*/

    this.stores[bindAs] = {
      bindAs,
      store,
      bindHash,
      onBind: _.cloneDeep(config.onBind),
      importData: Object.assign({}, config.importData || {}),
      disposers: {
        list: [],
        services: {},
      },
    };
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

  notifyOnBind(store) {
    if (store.onBind) {
      store.onBind.forEach((onBindItem) => {
        let bindCnt = 0;
        const cb = onBindItem[onBindItem.length - 1];
        onBindItem.forEach((storeName) => {
          if (typeof storeName !== 'function') {
            if (this.getStore(storeName).store) {
              bindCnt++;
            }
          }
        });
        if (bindCnt === onBindItem.length - 1 && typeof cb === 'function') {
          cb.call(store.store);
        }
      });
    }
  }

  isDebug(bindAs) {
    const s = this.getStore(bindAs).store;
    return s && s.config ? s.config.debug : false;
  }

  processStore(from, to) {
    if (from.bindAs !== to.bindAs) {
      const importData = to.importData;

      if (importData[from.bindAs]) {
        _.each(importData[from.bindAs], (toVarName, fromVarName) => {
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

          Object.defineProperty(to.store, toVarName, { get: () => {
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
    const storeSettings = this.getStore(bindAs);
    let pass = true;

    services.forEach((serviceName) => {
      if (!this.isBinded(serviceName)) {
        this.showMessage(`Imposible add disposer for not bind service "${bindAs}".`, 'warn');
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

  isBinded(bindAs) {
    return !!(this.stores[bindAs] && this.stores[bindAs].store);
  }

  getStore(bindAs) {
    return this.stores[bindAs] || {};
  }

  unbind(store) {
    const config = store.getConfig();
    const bindAs = config.bindAs;
    const storeSettings = this.getStore(bindAs);

    if (_.isEmpty(storeSettings)) {
      this.showMessage(`Not binded store "${bindAs}" try to unbind!`, 'warn');
      return;
    }

    // unbind data exporting to other stores
    _.each(this.stores, (item) => {
      if (item) {
        const importData = item.importData[bindAs];
        // console.log([importData]);
        if (importData) {
          // console.log(['unbind data exporting to other stores', item.bindAs, importData]);
          this.unbindData(item.bindAs, importData);
        }
      }
    });

    // unbind data importing from other stores
    _.each(storeSettings.importData, (importData) => {
      this.unbindData(bindAs, importData);
    });

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
  }

  unbindData(bindAs, importData) {
    const store = this.getStore(bindAs).store;
    _.each(importData, (toVarName) => {
      if (toVarName in store) {
        Object.defineProperty(store, toVarName, { value: undefined });
      }
    });
  }

  unbindDisposers(bindAs) {
    _.each(this.stores, (store) => {
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
}

export default Binder;

