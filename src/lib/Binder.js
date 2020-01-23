// @flow
/* eslint-disable method-can-be-static, class-methods-use-this, no-console */

/**
 * Binder - is a DI implementation class. Some classes may to communicate to each other through Binder.
 * Binder register services and call callback functions to resolve dependencies of one service to another
 *
 * Binder operation algorithm
 *  - While service binding to Binder or unbind it notify other services whose
 *  are waiting for it and provide the list of callbacks
 *  which should be called then other services will bind to Binder or unbind too.
 */

import { each, cloneDeep, includes } from 'lodash';
import { toJS } from 'mobx';
import { protoName } from './helper/util';
import EventEmitter from './helper/EventEmitter.js';
import type { ServiceConfigBindAsType,
  ServiceConfigCallbackSetType,
  InternalCallbackSetType,
  BinderConfigType,
  StartServiceReturnType,
  ServiceClassType,
  ServiceStartConfigType,
} from './typing/common.js';
import type { BinderInterface } from './typing/binderInterface.js';


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


type ServiceSettingsType = {
  bindAs: ServiceConfigBindAsType,
  service: *,
  options: BinderConfigType,
  disposers:{
    list: Array<*>,
    services: *
  }
};

class Binder implements BinderInterface {
  services: { [key: ServiceConfigBindAsType]: ?ServiceSettingsType } = {};

  depsList: { [key: $Values<typeof CALLBACK_NAME>]:
      { [key: ServiceConfigBindAsType]: Array<ServiceConfigBindAsType> } } = {
        [CALLBACK_NAME.BIND]: {},
        [CALLBACK_NAME.UNBIND]: {},
      };

  pendingStartResolvers:{ [key: ServiceConfigBindAsType]: Promise<*> } = {};

  parentBinder: BinderInterface;

  emitter: EventEmitter = new EventEmitter();

  allowParentOperation: boolean = false;

  constructor(parentBinder: BinderInterface): void {
    if (parentBinder instanceof Binder) {
      this.parentBinder = parentBinder;
      each(parentBinder.services, ({ service, options }: {service: *, options: BinderConfigType}): void => {
        this.addService(service, options);
      });

      parentBinder.emitter.subscribe(EMITTER_EVENT.BIND, ({ service, options }): void => {
        this.bind(service, options);
      });

      parentBinder.emitter.subscribe(EMITTER_EVENT.UNBIND, (bindAs: ServiceConfigBindAsType): void => {
        this.allowParentOperation = true;
        this.unbind(bindAs);
        this.allowParentOperation = false;
      });
    }
  }

  createService(Service: ServiceClassType, protoAttrs?: ?Array<*>): * {
    if (protoAttrs && !Array.isArray(protoAttrs)) {
      throw new Error(`Wrong ServiceParams! (${Service.name})`);
    }
    return protoAttrs ? new Service(...protoAttrs) : new Service();
  }
  /**
   * start and bind service
   */
  start(
    serviceStartConfig: ServiceStartConfigType,
  ): Promise<*> {
    const { binderConfig, proto } = serviceStartConfig;
    const {
      bindAs,
      onStart,
    } = binderConfig;

    let result;
    const resolver = this.getPendingStartResolver(bindAs);
    const serviceInBinder = this.getService(bindAs);


    if (serviceInBinder) {
      result = Promise.resolve({ service: serviceInBinder, started: false, serviceStartConfig });
    } else if (resolver) {
      result = resolver;
    } else {
      result = new Promise(
        (resolve: (data: StartServiceReturnType) => void, reject: (error: Error) => void): void => {
          console.log(['serviceStartConfig', bindAs, serviceStartConfig]);
          const service = serviceStartConfig.factory ?
            serviceStartConfig.factory() :
            this.createService(proto, serviceStartConfig.protoAttrs);
          if (!service || typeof service !== 'object') {
            throw Error(`Binder service start error. Service "${bindAs}" is not a valid object`);
          }

          const resolveData = { service, started: true, serviceStartConfig };
          let onStartResult;

          if (onStart && !Array.isArray(onStart)) {
            throw Error(`Binder onStart error. onStart callback of "${bindAs}" is not valid`);
          }

          if (onStart && onStart.length) {
            const {
              callback,
              serviceList,
              // $FlowIgnore
            } = this.destructCallback(onStart);

            if (!this.isListBind(serviceList)) {
              // eslint-disable-next-line max-len
              throw Error(`Binder onStart error. onStart callback of "${bindAs}" wait for service list (${serviceList ? serviceList.join(',') : ''}) to be bind, but some services are not bind ${this.getNotBind(serviceList).join(',')}`);
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
              .then(
                (): void => {
                  this.bind(service, binderConfig);
                  resolve(resolveData);
                },
              )
              .catch(
                (err: Error): void => {
                  reject(err);
                },
              );
          } else if (onStartResult === true) {
            this.bind(service, binderConfig);
            resolve(resolveData);
          } else {
            reject(new Error(`Service ${bindAs} onStart return "false"`));
          }
        },
      ).finally(() => {
        this.setPendingStartResolver(bindAs, null);
      });

      this.setPendingStartResolver(bindAs, result);
    }

    return result;
  }

  /**
   * stop and unbind service
   */
  stop(serviceStartConfig: ServiceStartConfigType): void {
    const {
      bindAs,
      onStop,
    } = serviceStartConfig.binderConfig;

    const serviceInBinder = this.getService(bindAs);
    const onStopFunctionName = onStop || 'onStop';

    if (serviceInBinder) {
      this.unbind(bindAs);
      if (typeof serviceInBinder[onStopFunctionName] === 'function') {
        serviceInBinder[onStopFunctionName]();
      }
    }
  }


  /**
   * bind service to the binder
   */
  bind(service: *, options: BinderConfigType): void {
    if (!options) {
      throw new Error('Binder options is not valid');
    }

    const { bindAs } = options;


    if (typeof bindAs !== 'string' || !bindAs.length) {
      throw new Error(`Service "${protoName(service)}" has not valid "bindAs" id "${bindAs}".`);
    }

    this.validateCallback(options, CALLBACK_NAME.BIND);
    this.validateCallback(options, CALLBACK_NAME.UNBIND);

    if (this.isBind(bindAs)) {
      throw new Error(`Service "${bindAs}" was already bind.`);
    }

    if (typeof service !== 'object') {
      throw new Error(`Service bind param is not an object ("${bindAs}").`);
    }

    this.addService(service, options);

    /* -- Legacy -- */

    if (this.isDebug(bindAs)) {
      this.showMessage(`"${bindAs}" bind.`);
    }
    each(this.services, (item) => {
      if (item) {
        this.processService(item, this.getServiceSettings(bindAs));
        this.processService(this.getServiceSettings(bindAs), item);
      }
    });
    /* --/ Legacy -- */

    // save OnBind dependencies of the current service
    this.saveDeps(bindAs, CALLBACK_NAME.BIND);
    // save OnUnbind dependencies of the current service
    this.saveDeps(bindAs, CALLBACK_NAME.UNBIND);
    // check anf resolve dependencies for OnBind events
    this.handleOnBind(bindAs);
    // emmit event for child Binders
    this.emitter.emit(EMITTER_EVENT.BIND, { service, options });
  }

  /**
   * add service to the storage of services
   */
  addService(service: *, options: BinderConfigType): void {
    const { bindAs } = options;

    const optionsCopy = cloneDeep(options);

    if (optionsCopy.onUnbind) {
      optionsCopy.onUnbind.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
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
  handleOnBind(bindAs: ServiceConfigBindAsType): void {
    const settings = this.getServiceSettings(bindAs);

    if (settings) {
      const onBindCallbackSetList = settings.options && settings.options[CALLBACK_NAME.BIND];
      const onUnbindCallbackSetList = settings.options && settings.options[CALLBACK_NAME.UNBIND];
      // check and execute OnBind dependencies of other services on the current service
      this.handleOnBindItem(bindAs);
      // check and execute OnUnbind dependencies of other services on the current service
      this.handleOnUnbindItem(bindAs);
      // check and execute OnBind dependencies from the list of dependencies of the current service
      this.lookOverCallback(onBindCallbackSetList, (serviceName) => {
        this.handleOnBindItem(serviceName);
      });
      // check and execute OnUnbind dependencies from the list of dependencies of the current service
      this.lookOverCallback(onUnbindCallbackSetList, (serviceName) => {
        this.handleOnUnbindItem(serviceName);
      });
    }
  }

  /**
   * handle OnBind callback item to resolve it
   */
  handleOnBindItem(bindAs: ServiceConfigBindAsType): void {
    this.lookOverDeps(bindAs, CALLBACK_NAME.BIND,
      (depBindAs: ServiceConfigBindAsType,
        callbackSet: InternalCallbackSetType, service: *): void => {
        const {
          callback,
          serviceList,
        } = this.destructCallback(callbackSet);

        if (!callbackSet.__locked && this.isListBind(serviceList)) {
          this.applyCallback(depBindAs, callbackSet, serviceList, callback, service, CALLBACK_NAME.BIND);
        } else {
          this.checkCallBackResolved(depBindAs, callbackSet, serviceList);
        }
      });
  }

  /**
   * look over all OnUnbind callbacks and resolve dependencies
   */
  handleOnUnbind(bindAs: ServiceConfigBindAsType): void {
    this.lookOverDeps(bindAs, CALLBACK_NAME.BIND,
      (depBindAs: ServiceConfigBindAsType, callbackSet: InternalCallbackSetType): void => {
        const {
          serviceList,
        } = this.destructCallback(callbackSet);

        if (callbackSet.__locked && this.isListUnBind(serviceList)) {
          // eslint-disable-next-line no-param-reassign
          delete callbackSet.__locked;
        }
      });

    this.lookOverDeps(bindAs, CALLBACK_NAME.UNBIND,
      (depBindAs: ServiceConfigBindAsType, callbackSet: InternalCallbackSetType, service: *): void => {
        const {
          callback,
          serviceList,
        } = this.destructCallback(callbackSet);

        if (!callbackSet.__locked && this.isListUnBind(serviceList)) {
          this.applyCallback(depBindAs, callbackSet, serviceList, callback, service, CALLBACK_NAME.UNBIND);
        }
      });
  }

  /**
   * handle OnUnbind callback item to resolve it
   */
  handleOnUnbindItem(bindAs: ServiceConfigBindAsType): void {
    this.lookOverDeps(bindAs, CALLBACK_NAME.UNBIND,
      (depBindAs: ServiceConfigBindAsType, callbackSet: InternalCallbackSetType) => {
        const {
          serviceList,
        } = this.destructCallback(callbackSet);

        if (this.isListBind(serviceList) && callbackSet.__locked) {
          // eslint-disable-next-line no-param-reassign
          delete callbackSet.__locked;
        }
      });
  }


  /**
   * check if callback was resolved if not send warning to console
   */
  checkCallBackResolved(bindAs: ServiceConfigBindAsType,
    callbackSet: InternalCallbackSetType,
    serviceList: ?Array<ServiceConfigBindAsType>): void {
    if (callbackSet.__resolveTM) {
      clearTimeout(callbackSet.__resolveTM);
    }
    // eslint-disable-next-line no-param-reassign
    callbackSet.__resolveTM = setTimeout(() => {
      const notBind = this.getNotBind(serviceList);
      const cbName = callbackSet[callbackSet.length - 1];

      if (serviceList && notBind.length && notBind.length < serviceList.length) {
        this.showMessage(`"${bindAs}.${typeof cbName === 'string' ? cbName : CALLBACK_NAME.BIND}"
        not called, because "${notBind.join(',')}" still not resolved.`, MESSAGE_TYPES.WARN);
      }
      // eslint-disable-next-line no-param-reassign
      delete callbackSet.__resolveTM;
    }, 1000);
  }


  /**
   * apply callback
   */

  applyCallback(bindAs: ServiceConfigBindAsType,
    callbackSet: InternalCallbackSetType,
    serviceList: ?Array<ServiceConfigBindAsType>,
    callback: ?string | ()=>void, service: *, callbackType: $Values<typeof CALLBACK_NAME>): void {
    const funcToCall = this.parseCallback(callback, service);

    if (funcToCall) {
      funcToCall.apply(service, callbackType === CALLBACK_NAME.BIND ? this.getServiceList(serviceList) : []);

      // eslint-disable-next-line no-param-reassign
      callbackSet.__locked = true;
      this.emitter.emit(EMITTER_EVENT.CALLBACK_CALLED, { bindAs, callbackType, callback, serviceList });
    } else {
      throw new Error(`${callbackType} method
      ${typeof callback === 'string' ? callback : ''} not found in "${bindAs}".`);
    }
  }

  /**
   * get list of service id and return service instance list
   */
  getServiceList(serviceList: ?Array<ServiceConfigBindAsType>): Array<*> {
    return serviceList ? serviceList.reduce((acc, bindAs) => {
      const service = this.getService(bindAs);
      if (service) {
        acc.push(service);
      }
      return acc;
    }, [])
      : [];
  }

  /**
   * look over callback list of the service and every iteration call function which was passed as attribute
   */
  lookOverCallback(callbackSetList: ?Array<*>,
    cb: (serviceName: ServiceConfigBindAsType) => void): void {
    if (callbackSetList) {
      callbackSetList.forEach((callbackSet: ServiceConfigCallbackSetType): void => {
        const len = callbackSet.length;

        callbackSet.forEach((serviceName:ServiceConfigBindAsType, i: number): void => {
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
  lookOverDeps(bindAs: ServiceConfigBindAsType, callbackType: $Values<typeof CALLBACK_NAME>,
    cb:(depBindAs: ServiceConfigBindAsType, callbackSet: InternalCallbackSetType, service: *)=>void) {
    const list = this.depsList[callbackType][bindAs];

    if (list && list.length) {
      list.forEach((depBindAs: ServiceConfigBindAsType): void => {
        const settings = this.getServiceSettings(depBindAs);

        if (settings) {
          const callbackSetList = settings.options && settings.options[callbackType];
          const service = this.getService(depBindAs);

          if (callbackSetList) {
            callbackSetList.forEach((callbackSet) => {
              if (includes(callbackSet, bindAs)) {
                // $FlowIgnore
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
  validateCallback(options: BinderConfigType, callbackName: $Values<typeof CALLBACK_NAME>): void {
    const { bindAs } = options;

    const list = options[callbackName];
    if (list && list.length) {
      if (!Array.isArray(list[0])) {
        throw new Error(`Service "${bindAs}" ${callbackName} should contains
        Array on callback data"`);
      } else {
        this.lookOverCallback(list, (serviceName: ServiceConfigBindAsType): void => {
          if (bindAs === serviceName) {
            throw new Error(`Service "${bindAs}" ${callbackName} callback contains
          the same name as service name "${bindAs}"`);
          }
        });

        list.forEach((callback: ServiceConfigCallbackSetType) => {
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
  parseCallback(callback: ?string | ()=>void, service: *): ?()=>void {
    if (typeof callback === 'function') {
      return callback;
    } else if (typeof service[callback] === 'function') {
      return service[callback];
    }
    return null;
  }

  /**
   * return true if all services from list are bind
   */
  isListBind(list: ?Array<ServiceConfigBindAsType>): boolean {
    return list ? list.reduce((acc, bindAs) => {
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
  getNotBind(list: ?Array<ServiceConfigBindAsType>): Array<ServiceConfigBindAsType> {
    return list ? list.reduce((acc, bindAs) => {
      if (!this.isBind(bindAs)) {
        acc.push(bindAs);
      }
      return acc;
    }, []) : [];
  }

  /**
   * return true if all services from list are unbind
   */
  isListUnBind(list: ?Array<ServiceConfigBindAsType>): boolean {
    return list ? list.reduce((acc, bindAs) => {
      if (this.isBind(bindAs)) {
        // eslint-disable-next-line no-param-reassign
        acc = false;
      }
      return acc;
    }, true) : true;
  }

  /**
   * return true if service bind to parent Binder
   */
  isBindOnParent(bindAs: ServiceConfigBindAsType): boolean {
    return !!(this.parentBinder && this.parentBinder.isBind(bindAs));
  }

  /**
   * destruct callback set to service list and callback function or function name
   */
  destructCallback(list: InternalCallbackSetType):
    {callback: ?string | ()=>void, serviceList: ?Array<ServiceConfigBindAsType>} {
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
  isBind(bindAs: ServiceConfigBindAsType): boolean {
    return !!(this.services[bindAs] && this.services[bindAs].service);
  }

  /**
   * return settings of the service
   */
  getServiceSettings(bindAs: ServiceConfigBindAsType): ?ServiceSettingsType {
    return this.services[bindAs];
  }

  /**
   * save hash of dependencies of one service to another
   */
  saveDeps(bindAs: ServiceConfigBindAsType, callbackType: $Values<typeof CALLBACK_NAME>): void {
    if (this.isBindOnParent(bindAs)) {
      return;
    }

    const settings = this.getServiceSettings(bindAs);

    if (settings) {
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
  }

  /**
   * return promise resolve for starting service
   */
  getPendingStartResolver(bindAs:ServiceConfigBindAsType): ?Promise<*> {
    return this.pendingStartResolvers[bindAs];
  }

  /**
   * save promise resolve for starting service to avoid double call of onStart function
   */
  setPendingStartResolver(bindAs:ServiceConfigBindAsType, resolver: ?Promise<*>): void{
    if (resolver) {
      this.pendingStartResolvers[bindAs] = resolver;
    } else {
      delete this.pendingStartResolvers[bindAs];
    }
  }

  /**
   * unbind service
   */
  unbind(bindAs: ServiceConfigBindAsType): void {
    const serviceSettings = this.getServiceSettings(bindAs);

    if (!this.isBind(bindAs)) {
      this.showMessage(`Service "${bindAs}", which are not bind try to unbind!`, MESSAGE_TYPES.WARN);
      return;
    }

    if (this.isBindOnParent(bindAs) && !this.allowParentOperation) {
      throw new Error(`Try to unbind service "${bindAs}" from parent Binder.`);
    }

    /* -- Legacy -- */
    // unbind data exporting to other services
    each(this.services, (item) => {
      if (item) {
        const importData = item.options.importData && item.options.importData[bindAs];
        if (importData) {
          this.unbindData(item.bindAs, importData);
        }
      }
    });

    // unbind data importing from other services
    if (serviceSettings && serviceSettings.options.importData) {
      each(serviceSettings.options.importData, (importData) => {
        this.unbindData(bindAs, importData);
      });
    }

    // unbind disposers in this service
    if (serviceSettings && serviceSettings.disposers) {
      serviceSettings.disposers.list.forEach((disposer) => {
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
  getService(bindAs: ServiceConfigBindAsType): * {
    const settings = this.getServiceSettings(bindAs);
    return settings && settings.service;
  }

  /**
   * clear all binder data besides services
   */
  clear(): void {
    this.depsList = {
      [CALLBACK_NAME.BIND]: {},
      [CALLBACK_NAME.UNBIND]: {},
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
  showMessage(msg: string, type: string = 'info'): void {
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

  isDebug(bindAs: ServiceConfigBindAsType): ?boolean {
    const settings = this.getServiceSettings(bindAs);
    return settings && settings.options ? settings.options.debug : false;
  }

  processService(from: *, to: *) {
    if (from.bindAs !== to.bindAs) {
      const { importData } = to.options;

      if (importData && importData[from.bindAs]) {
        each(importData[from.bindAs], (toVarName, fromVarName) => {
          if (!(fromVarName in from.service)) {
            this.showMessage(`Variable "${fromVarName}" required for "${to.bindAs}"
            not found in "${from.bindAs}"`, MESSAGE_TYPES.WARN);
            return;
          }

          if (toVarName in to.service) {
            this.showMessage(`Trying create link from "${from.bindAs}.${fromVarName}"
            to "${to.bindAs}.${toVarName}", but variable "${toVarName}" is already exist in "${to.bindAs}"`,
            MESSAGE_TYPES.WARN);
            return;
          }

          Object.defineProperty(to.service, toVarName, {
            get: () => {
              if (this.isDebug(to.bindAs)) {
                this.showMessage(`Variable "${fromVarName}" from "${from.bindAs}"
              was taken by "${to.bindAs}" with name "${toVarName}"`);
              }

              return from.service[fromVarName];
            },
            configurable: true,
          });
        });
      }
    }
  }

  addDisposer(bindAs: ServiceConfigBindAsType, services: *, obsr: *) {
    const serviceSettings = this.getServiceSettings(bindAs);
    let pass = true;

    services.forEach((serviceName) => {
      if (!this.isBind(serviceName)) {
        this.showMessage(`Impossible add disposer for not bind service "${bindAs}".`, MESSAGE_TYPES.WARN);
        pass = false;
      }
    });

    if (pass && serviceSettings) {
      serviceSettings.disposers.list.push(obsr);

      services.forEach((serviceName) => {
        if (!serviceSettings.disposers.services[serviceName]) {
          serviceSettings.disposers.services[serviceName] = [];
        }

        serviceSettings.disposers.services[serviceName].push(serviceSettings.disposers.list.length - 1);
      });
    }

    return pass;
  }

  unbindDisposers(bindAs: ServiceConfigBindAsType) {
    each(this.services, (service) => {
      if (service && service.disposers.services[bindAs]) {
        service.disposers.services[bindAs].forEach((disposer) => {
          if (typeof service.disposers.list[disposer] === 'function') {
            service.disposers.list[disposer]();
            // eslint-disable-next-line no-param-reassign
            service.disposers.list[disposer] = undefined;
          }
        });
      }
    });
  }

  unbindData(bindAs: ServiceConfigBindAsType, importData: *) {
    const settings = this.getServiceSettings(bindAs);
    if (settings) {
      const { service } = settings;
      each(importData, (toVarName) => {
        if (toVarName in service) {
          Object.defineProperty(service, toVarName, { value: undefined });
        }
      });
    }
  }

  importVar(serviceName: ServiceConfigBindAsType, varName: string, initiator: string, raw: *) {
    const s = this.getServiceSettings(serviceName);
    const service = s && s.service ? s.service : null;
    let val;
    let exportData;

    if (s && s.service && service) {
      exportData = s.options.exportData;

      if (exportData && !exportData[varName]) {
        console.warn(`Warnning! Impossible import variable "${varName}" of
        "${s.bindAs}" for "${initiator}" because variable is not included to config.exportData.`);
        return;
      }

      val = service[varName];
      if (s.debug) {
        console.log(`Binder. "${initiator}" import variable "${varName}" from "${serviceName}".`, val);
      }
      return raw ? val : toJS(val); // eslint-disable-line
    }

    console.warn(`Warnning! importVar form "${protoName(this)}" to
    "${initiator}". "${serviceName}" service not found.`);

    return undefined; // eslint-disable-line
  }

  callApi(serviceName: ServiceConfigBindAsType,
    actionName: ServiceConfigBindAsType,
    initiator: ServiceConfigBindAsType, ...arg: Array<*>) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const s = this.getServiceSettings(serviceName);
    let serviceInst;

    if (s && s.service) {
      serviceInst = s.service;

      if (s.options.debug) {
        console.log(`Binder callApi. "${initiator}" calls method "${actionName}" from "${serviceName}".`, arg);
      }

      if (serviceInst.api && serviceInst.api[actionName]) {
        return serviceInst.api[actionName].apply(serviceInst, arg); // eslint-disable-line
      }
      console.warn(`CallApi warn. "${initiator}" calls unknown method
      "${actionName}" found in service "${serviceName}".`);
    } else {
      console.warn(`CallApi warn. "${initiator}" calls method "${actionName}" from not bind service "${serviceName}".`);
    }
  }
  /* --/ Legacy -- */
}

export default Binder;
