// @flow
/* eslint-disable class-methods-use-this, no-console */

/**
 * Binder - is a DI implementation class. Some classes may to communicate to each other through Binder.
 * Binder register services and call callback functions to resolve dependencies of one service to another
 *
 * Binder operation algorithm
 *  - While service binding to Binder or unbind it notify other services whose
 *  are waiting for it and provide the list of callbacks
 *  which should be called then other services will bind to Binder or unbind too.
 */

import { cloneDeep } from 'lodash';
import { toJS } from 'mobx';
import { protoName } from './helper/util.js';
import { EventEmitter } from './helper/EventEmitter.js';
import type {
  ServiceConfigBindAs,
  ServiceConfigCallbackSet,
  InternalCallbackSetType,
  BinderConfig,
  StartBindableEntityResult,
  BindableEntityStartConfig,
  BindableEntity,
  Constructor,
} from './typing/common.js';

enum EMITTER_EVENT {
  BIND,
  UNBIND,
  CALLBACK_CALLED,
}

enum MESSAGE_TYPE {
  ERROR,
  WARN,
  INFO,
}

type ServiceSettingsType<T extends object = object> = {
  debug?: boolean;
  bindAs?: ServiceConfigBindAs;
  service: T;
  options: BinderConfig;
  disposers?: {
    list: ((() => void) | void)[];
    services: Record<string, number[]>;
  };
};

export class Binder {
  services: Record<ServiceConfigBindAs, ServiceSettingsType | null> = {};

  depsList: Record<'onBind' | 'onUnbind', Record<ServiceConfigBindAs, ServiceConfigBindAs[]>> = {
    onBind: {},
    onUnbind: {},
  };

  pendingStartResolvers: Record<ServiceConfigBindAs, Promise<StartBindableEntityResult<any>>> = {};

  // eslint-disable-next-line no-use-before-define
  parentBinder?: Binder;

  emitter = new EventEmitter<{
    [EMITTER_EVENT.BIND]: ServiceSettingsType;
    [EMITTER_EVENT.UNBIND]: ServiceConfigBindAs;
    [EMITTER_EVENT.CALLBACK_CALLED]: any;
  }>();

  allowParentOperation = false;

  constructor(parentBinder?: Binder) {
    if (parentBinder instanceof Binder) {
      this.parentBinder = parentBinder;
      Object.values(parentBinder.services).forEach(settings => {
        if (settings) {
          this.addService(settings.service, settings.options);
        }
      });

      parentBinder.emitter.subscribe(EMITTER_EVENT.BIND, ({ service, options }) => {
        this.bind(service, options);
      });

      parentBinder.emitter.subscribe(EMITTER_EVENT.UNBIND, bindAs => {
        this.allowParentOperation = true;
        this.unbind(bindAs);
        this.allowParentOperation = false;
      });
    }
  }

  createService<T extends object, A extends unknown[]>(
    ServiceCtr: Constructor<T, A>,
    protoAttrs: A,
  ): T {
    if (protoAttrs && !Array.isArray(protoAttrs)) {
      throw new Error(`Wrong ServiceParams! (${ServiceCtr.name})`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return new ServiceCtr(...protoAttrs);
  }

  /**
   * start and bind service
   */
  start<T extends object, A extends unknown[] = unknown[]>(
    serviceStartConfig: BindableEntityStartConfig<T, A>,
  ): Promise<StartBindableEntityResult<T, A>> {
    const { binderConfig, proto } = serviceStartConfig;

    if (!binderConfig) {
      throw new Error('Binder config is not defined!');
    }

    const { bindAs, onStart } = binderConfig;

    let result: Promise<StartBindableEntityResult<T, A>>;
    const resolver = this.getPendingStartResolver(bindAs);
    const serviceInBinder = this.getService(bindAs);

    if (serviceInBinder) {
      result = Promise.resolve({
        service: serviceInBinder as T,
        started: false,
        serviceStartConfig,
      });
    } else if (resolver) {
      result = resolver as unknown as Promise<StartBindableEntityResult<T, A>>;
    } else {
      result = new Promise<StartBindableEntityResult<T, A>>((resolve, reject): void => {
        const service = serviceStartConfig.factory
          ? serviceStartConfig.factory()
          : this.createService(proto, serviceStartConfig.protoAttrs);

        if (!service || typeof service !== 'object') {
          throw Error(`Binder service start error. Service "${bindAs}" is not a valid object`);
        } else if (!(service instanceof proto)) {
          throw Error(`Binder service start error. Service "${bindAs}"
            prototype does not match service factory result`);
        }

        const resolveData = { service, started: true, serviceStartConfig };
        let onStartResult: unknown;

        if (onStart && !Array.isArray(onStart)) {
          throw Error(`Binder onStart error. onStart callback of "${bindAs}" is not valid`);
        }

        if (onStart && onStart.length) {
          const { callback, serviceList } = this.destructCallback(onStart);

          if (!this.isListBind(serviceList)) {
            // eslint-disable-next-line max-len
            throw Error(
              `Binder onStart error. onStart callback of "${bindAs}" wait for service list (${
                serviceList ? serviceList.join(',') : ''
              }) to be bind, but some services are not bind ${this.getNotBind(serviceList).join(
                ',',
              )}`,
            );
          }

          const funcToCall = this.parseCallback(callback, service);

          if (funcToCall) {
            onStartResult = funcToCall.apply(service, this.getServiceList(serviceList));
          }
        }

        if (typeof onStartResult === 'undefined') {
          this.bind(service, binderConfig);
          resolve(resolveData);
        } else if (onStartResult instanceof Promise) {
          onStartResult
            .then((): void => {
              this.bind(service, binderConfig);
              resolve(resolveData);
            })
            .catch((err: Error): void => {
              reject(err);
            });
        } else if (onStartResult === true) {
          this.bind(service, binderConfig);
          resolve(resolveData);
        } else {
          reject(new Error(`Service ${bindAs} onStart return "false"`));
        }
      }).finally(() => {
        this.setPendingStartResolver(bindAs, null);
      });

      this.setPendingStartResolver(bindAs, result);
    }

    return result;
  }

  /**
   * stop and unbind service
   */
  stop(serviceStartConfig: BindableEntityStartConfig<any>): void {
    const { bindAs, onStop } = serviceStartConfig.binderConfig;

    const serviceInBinder = this.getService(bindAs);
    const onStopFunctionName = onStop || 'onStop';

    if (serviceInBinder) {
      this.unbind(bindAs);
      // @ts-expect-error - user-land fn
      if (typeof serviceInBinder[onStopFunctionName] === 'function') {
        // @ts-expect-error - user-land fn
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        serviceInBinder[onStopFunctionName]();
      }
    }
  }

  /**
   * bind service to the binder
   */
  bind(service: object, options: BinderConfig): void {
    if (!options) {
      throw new Error('Binder options is not valid');
    }

    const { bindAs } = options;
    if (typeof bindAs !== 'string' || !bindAs.length) {
      throw new Error(`Service "${protoName(service)}" has not valid "bindAs" id "${bindAs}".`);
    }

    this.validateCallback(options, 'onBind');
    this.validateCallback(options, 'onUnbind');

    if (this.isBind(bindAs)) {
      throw new Error(`Service "${bindAs}" was already bind.`);
    }

    if (typeof service !== 'object') {
      throw new Error(`Service bind param is not an object ("${bindAs}").`);
    }

    this.addService(service, options);

    /* -- Legacy -- */
    // if legacy service try to bind from this.parentBinder legacy method processService should not be called
    if (!this.parentBinder) {
      if (this.isDebug(bindAs)) {
        this.showMessage(`"${bindAs}" bind.`);
      }
      Object.values(this.services).forEach(item => {
        if (item) {
          const serviceSettings = this.getServiceSettings(bindAs);

          if (serviceSettings) {
            this.processService(item, serviceSettings);
            this.processService(serviceSettings, item);
          }
        }
      });
    }

    /* --/ Legacy -- */

    // save OnBind dependencies of the current service
    this.saveDeps(bindAs, 'onBind');
    // save OnUnbind dependencies of the current service
    this.saveDeps(bindAs, 'onUnbind');
    // check anf resolve dependencies for OnBind events
    this.handleOnBind(bindAs);
    // emmit event for child Binders
    this.emitter.emit(EMITTER_EVENT.BIND, { service, options });
  }

  /**
   * add service to the storage of services
   */
  addService(service: object, options: BinderConfig): void {
    const { bindAs } = options;
    const optionsCopy = cloneDeep(options);

    if (optionsCopy.onUnbind) {
      optionsCopy.onUnbind.forEach(item => {
        item.__locked = true;
      });
    }

    this.services[bindAs] = {
      bindAs,
      service,
      options: optionsCopy,
      disposers: {
        list: [],
        services: {},
      },
    };
  }

  /**
   * look over all OnBind callbacks and resolve dependencies
   */
  handleOnBind(bindAs: ServiceConfigBindAs): void {
    const settings = this.getServiceSettings(bindAs);

    if (settings) {
      const onBindCallbackSetList = settings.options?.onBind ?? null;
      const onUnbindCallbackSetList = settings.options?.onUnbind ?? null;
      // check and execute OnBind dependencies of other services on the current service
      this.handleOnBindItem(bindAs);
      // check and execute OnUnbind dependencies of other services on the current service
      this.handleOnUnbindItem(bindAs);
      // check and execute OnBind dependencies from the list of dependencies of the current service
      this.lookOverCallback(onBindCallbackSetList, serviceName => {
        this.handleOnBindItem(serviceName);
      });
      // check and execute OnUnbind dependencies from the list of dependencies of the current service
      this.lookOverCallback(onUnbindCallbackSetList, serviceName => {
        this.handleOnUnbindItem(serviceName);
      });
    }
  }

  /**
   * handle OnBind callback item to resolve it
   */
  handleOnBindItem(bindAs: ServiceConfigBindAs): void {
    this.lookOverDeps(bindAs, 'onBind', (depBindAs, callbackSet, service): void => {
      const { callback, serviceList } = this.destructCallback(callbackSet);

      if (!callbackSet.__locked && this.isListBind(serviceList)) {
        this.applyCallback(depBindAs, callbackSet, serviceList, callback, service, 'onBind');
      } else {
        this.checkCallBackResolved(depBindAs, callbackSet, serviceList);
      }
    });
  }

  /**
   * look over all OnUnbind callbacks and resolve dependencies
   */
  handleOnUnbind(bindAs: ServiceConfigBindAs): void {
    this.lookOverDeps(bindAs, 'onBind', (_, callbackSet): void => {
      const { serviceList } = this.destructCallback(callbackSet);

      if (callbackSet.__locked && this.isListUnBind(serviceList)) {
        // eslint-disable-next-line no-param-reassign
        delete callbackSet.__locked;
      }
    });

    this.lookOverDeps(bindAs, 'onUnbind', (depBindAs, callbackSet, service): void => {
      const { callback, serviceList } = this.destructCallback(callbackSet);

      if (!callbackSet.__locked && this.isListUnBind(serviceList)) {
        this.applyCallback(depBindAs, callbackSet, serviceList, callback, service, 'onUnbind');
      }
    });
  }

  /**
   * handle OnUnbind callback item to resolve it
   */
  handleOnUnbindItem(bindAs: ServiceConfigBindAs): void {
    this.lookOverDeps(bindAs, 'onUnbind', (_, callbackSet) => {
      const { serviceList } = this.destructCallback(callbackSet);

      if (this.isListBind(serviceList) && callbackSet.__locked) {
        // eslint-disable-next-line no-param-reassign
        delete callbackSet.__locked;
      }
    });
  }

  /**
   * check if callback was resolved if not send warning to console
   */
  checkCallBackResolved(
    bindAs: ServiceConfigBindAs,
    callbackSet: InternalCallbackSetType,
    serviceList: ServiceConfigBindAs[] | null,
  ): void {
    if (callbackSet.__resolveTM) {
      clearTimeout(callbackSet.__resolveTM);
    }
    // eslint-disable-next-line no-param-reassign
    callbackSet.__resolveTM = setTimeout(() => {
      const notBind = this.getNotBind(serviceList);
      const cbName = callbackSet[callbackSet.length - 1];

      if (serviceList && notBind.length && notBind.length < serviceList.length) {
        this.showMessage(
          `"${bindAs}.${typeof cbName === 'string' ? cbName : 'onBind'}"
        not called, because "${notBind.join(',')}" still not resolved.`,
          MESSAGE_TYPE.WARN,
        );
      }
      // eslint-disable-next-line no-param-reassign
      delete callbackSet.__resolveTM;
    }, 1000);
  }

  /**
   * apply callback
   */
  applyCallback(
    bindAs: ServiceConfigBindAs,
    callbackSet: InternalCallbackSetType,
    serviceList: ServiceConfigBindAs[] | null,
    callback: string | (() => void) | null,
    service: object,
    callbackType: 'onBind' | 'onUnbind',
  ): void {
    const funcToCall = this.parseCallback(callback, service);

    if (funcToCall) {
      funcToCall.apply(service, callbackType === 'onBind' ? this.getServiceList(serviceList) : []);

      // eslint-disable-next-line no-param-reassign
      callbackSet.__locked = true;
      this.emitter.emit(EMITTER_EVENT.CALLBACK_CALLED, {
        bindAs,
        callbackType,
        callback,
        serviceList,
      });
    } else {
      throw new Error(`${callbackType} method
      ${typeof callback === 'string' ? callback : ''} not found in "${bindAs}".`);
    }
  }

  /**
   * get list of service id and return service instance list
   */
  getServiceList(serviceList: ServiceConfigBindAs[] | null): object[] {
    if (!serviceList) {
      return [];
    }

    return serviceList.reduce<object[]>((acc, bindAs) => {
      const service = this.getService(bindAs);
      if (service) {
        acc.push(service);
      }
      return acc;
    }, []);
  }

  /**
   * look over callback list of the service and every iteration call function which was passed as attribute
   */
  lookOverCallback(
    callbackSetList: ServiceConfigCallbackSet[] | null,
    cb: (serviceName: ServiceConfigBindAs) => void,
  ): void {
    if (callbackSetList) {
      callbackSetList.forEach(callbackSet => {
        const len = callbackSet.length;

        callbackSet.forEach((serviceName, i) => {
          if (i < len - 1) {
            cb(serviceName);
          }
        });
      });
    }
  }

  /**
   * look over dependency list of the service and every iteration call function which was passed as attribute
   */
  lookOverDeps(
    bindAs: ServiceConfigBindAs,
    callbackType: 'onBind' | 'onUnbind',
    cb: (
      depBindAs: ServiceConfigBindAs,
      callbackSet: InternalCallbackSetType,
      service: object,
    ) => void,
  ) {
    const list = this.depsList[callbackType][bindAs];

    if (list && list.length) {
      list.forEach((depBindAs: ServiceConfigBindAs): void => {
        const settings = this.getServiceSettings(depBindAs);

        if (settings) {
          const callbackSetList = settings.options && settings.options[callbackType];
          const service = this.getService(depBindAs);

          if (service && callbackSetList) {
            callbackSetList.forEach(callbackSet => {
              if (callbackSet.includes(bindAs)) {
                cb(depBindAs, callbackSet, service);
              }
            });
          }
        }
      });
    }
  }

  /**
   * validate callback set data format
   */
  validateCallback(options: BinderConfig, callbackName: 'onBind' | 'onUnbind'): void {
    const { bindAs } = options;

    const list = options[callbackName];
    if (list && list.length) {
      if (!Array.isArray(list[0])) {
        throw new Error(`Service "${bindAs}" ${callbackName} should contains
        Array on callback data"`);
      } else {
        this.lookOverCallback(list, (serviceName: ServiceConfigBindAs): void => {
          if (bindAs === serviceName) {
            throw new Error(`Service "${bindAs}" ${callbackName} callback contains
          the same name as service name "${bindAs}"`);
          }
        });

        list.forEach((callback: ServiceConfigCallbackSet) => {
          if (callback.length < 2) {
            throw new Error(`Service "${bindAs}" ${callbackName} should contains
        Array this at least 2 items, but ${callback.length} given [${callback.join(',')}]."`);
          }
        });
      }
    }
  }

  /**
   * parse callback
   */
  parseCallback<T extends object>(
    callback: string | ((...args: unknown[]) => void) | null,
    service: T,
  ): ((...args: unknown[]) => void) | null {
    if (typeof callback === 'function') {
      return callback;
    }
    // @ts-expect-error hard to make types-strict
    if (callback && typeof service[callback] === 'function') {
      // @ts-expect-error hard to make types-strict
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return service[callback];
    }
    return null;
  }

  /**
   * return true if all services from list are bind
   */
  isListBind(list: ServiceConfigBindAs[] | null): boolean {
    return list
      ? list.reduce((acc, bindAs) => {
          if (!this.isBind(bindAs)) {
            // eslint-disable-next-line no-param-reassign
            acc = false;
          }
          return acc;
        }, true)
      : false;
  }

  /**
   * return list of ids for services which are not bind
   */
  getNotBind(list: ServiceConfigBindAs[] | null): ServiceConfigBindAs[] {
    return list
      ? list.reduce<ServiceConfigBindAs[]>((acc, bindAs) => {
          if (!this.isBind(bindAs)) {
            acc.push(bindAs);
          }
          return acc;
        }, [])
      : [];
  }

  /**
   * return true if all services from list are unbind
   */
  isListUnBind(list: ServiceConfigBindAs[] | null): boolean {
    return list
      ? list.reduce<boolean>((acc, bindAs) => {
          if (this.isBind(bindAs)) {
            // eslint-disable-next-line no-param-reassign
            acc = false;
          }
          return acc;
        }, true)
      : true;
  }

  /**
   * return true if service bind to parent Binder
   */
  isBindOnParent(bindAs: ServiceConfigBindAs): boolean {
    return !!(this.parentBinder && this.parentBinder.isBind(bindAs));
  }

  /**
   * destruct callback set to service list and callback function or function name
   */
  destructCallback(list: InternalCallbackSetType): {
    callback: string | (() => void) | null;
    serviceList: ServiceConfigBindAs[] | null;
  } {
    const len = list && list.length;
    const callback = len ? list[len - 1] : null;
    const serviceList = len ? list.slice(0, len - 1) : null;

    return {
      serviceList,
      callback,
    };
  }

  /**
   * return true if service bind
   */
  isBind(bindAs: ServiceConfigBindAs): boolean {
    const binding = this.services[bindAs];
    return !!(binding && binding.service);
  }

  /**
   * return settings of the service
   */
  getServiceSettings<T extends object>(bindAs: ServiceConfigBindAs): ServiceSettingsType<T> | null {
    return (this.services[bindAs] as ServiceSettingsType<T>) ?? null;
  }

  /**
   * save hash of dependencies of one service to another
   */
  saveDeps(bindAs: ServiceConfigBindAs, callbackType: 'onBind' | 'onUnbind'): void {
    if (this.isBindOnParent(bindAs)) {
      return;
    }

    const settings = this.getServiceSettings(bindAs);

    if (settings) {
      const deps = settings.options && settings.options[callbackType];

      if (deps && deps.length) {
        deps.forEach(list => {
          const len = list && list.length;
          list.forEach((item, i) => {
            if (i < len - 1) {
              if (!this.depsList[callbackType][item]) {
                this.depsList[callbackType][item] = [];
              }
              if (!this.depsList[callbackType][item].includes(bindAs)) {
                this.depsList[callbackType][item].push(bindAs);
              }
            }
          });
        });
      }
    }
  }

  /**
   * return promise resolve for starting service
   */
  getPendingStartResolver(
    bindAs: ServiceConfigBindAs,
  ): Promise<StartBindableEntityResult<any>> | null {
    return this.pendingStartResolvers[bindAs] ?? null;
  }

  /**
   * save promise resolve for starting service to avoid double call of onStart function
   */
  setPendingStartResolver(
    bindAs: ServiceConfigBindAs,
    resolver: Promise<StartBindableEntityResult<any, any>> | null,
  ): void {
    if (resolver) {
      this.pendingStartResolvers[bindAs] = resolver;
    } else {
      delete this.pendingStartResolvers[bindAs];
    }
  }

  /**
   * unbind service
   */
  unbind(bindAs: ServiceConfigBindAs): void {
    const serviceSettings = this.getServiceSettings(bindAs);

    if (!this.isBind(bindAs)) {
      this.showMessage(`Service "${bindAs}", which are not bind try to unbind!`, MESSAGE_TYPE.WARN);
      return;
    }

    if (this.isBindOnParent(bindAs) && !this.allowParentOperation) {
      throw new Error(`Try to unbind service "${bindAs}" from parent Binder.`);
    }

    /* -- Legacy -- */
    // unbind data exporting to other services
    Object.values(this.services).forEach(item => {
      if (item) {
        const importData = item.options.importData?.[bindAs];
        if (importData && item.bindAs) {
          this.unbindData(item.bindAs, importData);
        }
      }
    });

    // unbind data importing from other services
    if (serviceSettings && serviceSettings.options.importData) {
      Object.values(serviceSettings.options.importData).forEach(importData => {
        this.unbindData(bindAs, importData);
      });
    }

    // unbind disposers in this service
    if (serviceSettings && serviceSettings.disposers) {
      serviceSettings.disposers.list.forEach(disposer => {
        if (typeof disposer === 'function') {
          disposer();
        }
      });
    }

    // unbind disposers in other services
    this.unbindDisposers(bindAs);

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" unbind.`);
    }

    /* --/ Legacy -- */

    // clear service settings in binder
    delete this.services[bindAs];

    // check and execute dependencies on the OnUnbind event
    this.handleOnUnbind(bindAs);
    // emmit event for child services
    this.emitter.emit(EMITTER_EVENT.UNBIND, bindAs);
  }

  /**
   * return bind service
   */
  getService<T extends object>(bindAs: ServiceConfigBindAs): T | null {
    const settings = this.getServiceSettings<T>(bindAs);
    return settings?.service ?? null;
  }

  /**
   * clear all binder data besides services
   */
  clear(): void {
    this.depsList = {
      onBind: {},
      onUnbind: {},
    };

    this.pendingStartResolvers = {};
    this.emitter.clear();
  }

  /**
   * clear all binder data
   */
  clearAll(): void {
    this.clear();
    this.services = {};
  }

  /**
   * show message to console
   */
  showMessage(msg: string, type: MESSAGE_TYPE = MESSAGE_TYPE.INFO): void {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    switch (type) {
      case MESSAGE_TYPE.ERROR:
        console.error(`Binder. ${msg}`);
        break;
      case MESSAGE_TYPE.WARN:
        console.warn(`Binder. ${msg}`);
        break;
      case MESSAGE_TYPE.INFO:
        console.log(`Binder. ${msg}`);
        break;
      default:
        break;
    }
  }

  /* -- Legacy -- */
  isDebug(bindAs: ServiceConfigBindAs): boolean {
    const settings = this.getServiceSettings(bindAs);
    return settings && settings.options ? settings.options.debug ?? false : false;
  }

  processService(from: ServiceSettingsType, to: ServiceSettingsType) {
    if (from.bindAs !== to.bindAs) {
      const { importData } = to.options;
      const fromBindAs = from.bindAs;
      const toBindAs = to.bindAs;

      if (fromBindAs && toBindAs && importData && importData[fromBindAs]) {
        Object.entries(importData[fromBindAs]).forEach(([fromVarName, toVarName]) => {
          if (!(fromVarName in from.service)) {
            this.showMessage(
              `Variable "${fromVarName}" required for "${toBindAs}"
            not found in "${fromBindAs}"`,
              MESSAGE_TYPE.WARN,
            );
            return;
          }

          if (toVarName in to.service) {
            this.showMessage(
              `Trying create link from "${fromBindAs}.${fromVarName}"
            to "${toBindAs}.${toVarName}", but variable "${toVarName}" is already exist in "${toBindAs}"`,
              MESSAGE_TYPE.WARN,
            );
            return;
          }

          Object.defineProperty(to.service, toVarName, {
            get: () => {
              if (this.isDebug(toBindAs)) {
                this.showMessage(`Variable "${fromVarName}" from "${fromBindAs}"
              was taken by "${toBindAs}" with name "${toVarName}"`);
              }

              // @ts-expect-error not typable
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return from.service[fromVarName];
            },
            configurable: true,
          });
        });
      }
    }
  }

  addDisposer(bindAs: ServiceConfigBindAs, services: ServiceConfigBindAs[], obsr: () => unknown) {
    const serviceSettings = this.getServiceSettings(bindAs);
    let pass = true;

    services.forEach(serviceName => {
      if (!this.isBind(serviceName)) {
        this.showMessage(
          `Impossible add disposer for not bind service "${bindAs}".`,
          MESSAGE_TYPE.WARN,
        );
        pass = false;
      }
    });

    if (pass && serviceSettings) {
      serviceSettings.disposers?.list.push(obsr);

      services.forEach(serviceName => {
        const disposeServices = serviceSettings.disposers?.services;
        const disposeList = serviceSettings.disposers?.list;

        if (!disposeServices || !disposeList) {
          return;
        }

        if (!disposeServices[serviceName]) {
          disposeServices[serviceName] = [];
        }

        disposeServices[serviceName].push(disposeList.length - 1);
      });
    }

    return pass;
  }

  unbindDisposers(bindAs: ServiceConfigBindAs) {
    Object.values(this.services).forEach(service => {
      if (service && service.disposers?.services[bindAs]) {
        for (const disposer of service.disposers.services[bindAs]) {
          const { list } = service.disposers;
          const d = list[disposer];
          if (typeof d === 'function') {
            d();
            // eslint-disable-next-line no-param-reassign
            list[disposer] = undefined;
          }
        }
      }
    });
  }

  unbindData(bindAs: ServiceConfigBindAs, importData: Record<string, string>) {
    const settings = this.getServiceSettings(bindAs);
    if (settings) {
      const { service } = settings;
      Object.values(importData).forEach(toVarName => {
        if (toVarName in service) {
          Object.defineProperty(service, toVarName, { value: undefined });
        }
      });
    }
  }

  importVar(serviceName: ServiceConfigBindAs, varName: string, initiator: string, raw: unknown) {
    const s = this.getServiceSettings(serviceName);
    const service = s && s.service ? s.service : null;
    let val: unknown;
    let exportData;

    if (s && s.service && service) {
      exportData = s.options.exportData;

      if (exportData && !exportData[varName]) {
        console.warn(`Warning! Impossible import variable "${varName}" of
        "${
          s.bindAs ?? 'unknown'
        }" for "${initiator}" because variable is not included to config.exportData.`);
        return;
      }

      // @ts-expect-error untypable
      val = service[varName] as unknown;
      if (s.debug) {
        console.log(
          `Binder. "${initiator}" import variable "${varName}" from "${serviceName}".`,
          val,
        );
      }
      return raw ? val : toJS(val); // eslint-disable-line
    }

    console.warn(`Warning! importVar form "${protoName(this)}" to
    "${initiator}". "${serviceName}" service not found.`);

    return undefined; // eslint-disable-line
  }

  callApi(
    serviceName: ServiceConfigBindAs,
    actionName: ServiceConfigBindAs,
    initiator: ServiceConfigBindAs,
    ...arg: unknown[]
  ) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const s = this.getServiceSettings(serviceName);
    let serviceInst: object | BindableEntity;

    if (s && s.service) {
      serviceInst = s.service;

      if (s.options.debug) {
        console.log(
          `Binder callApi. "${initiator}" calls method "${actionName}" from "${serviceName}".`,
          arg,
        );
      }

      if ('api' in serviceInst) {
        const bindableService = serviceInst as BindableEntity;
        if (bindableService.api && bindableService.api[actionName]) {
          return bindableService.api[actionName].apply(serviceInst, arg); // eslint-disable-line
        }
      }
      console.warn(`CallApi warn. "${initiator}" calls unknown method
      "${actionName}" found in service "${serviceName}".`);
    } else {
      console.warn(
        `CallApi warn. "${initiator}" calls method "${actionName}" from not bind service "${serviceName}".`,
      );
    }
  }
}
