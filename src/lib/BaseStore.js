/**
 отличия от боевого файла:
 - ворзвращается не функция а класс принимающий объект context
 - поле appBinder переименовано в биндер
 */
import _ from 'lodash';
import { observable } from 'mobx';
import { protoName } from './util.js';

export const STATUS_SERVICE_SLEEP = 'sleep';
export const STATUS_SERVICE_STARTING = 'starting';
export const STATUS_SERVICE_STARTED = 'started';
export const STATUS_SERVICE_STOPPING = 'stopping';
export const STATUS_SERVICE_STOPPED = 'stopped';
export const STATUS_SERVICE_FAIL = 'fail';

const ON_START = 'onStart';
const ON_STOP = 'onStop';


export default class BaseStore {
  disposers = [];
  disposerKeys = {};
  binder;
  mounted = false;
  @observable serviceStatus = STATUS_SERVICE_SLEEP;
  @observable serviceReady = false;
  @observable serviceWasStarted = false;
  serviceFail = null;
  alreadyStarting = false;
  alreadyStopping = false;
  initiators = [];

  constructor(context) {
    if (context) {
      this.binder = context.binder;
      this.serviceStarter = context.serviceStarter;
    }
  }

  start(initiatorId) {
    const waitFor = this.serviceStarter.waitFor(this);

    return waitFor
      ?
      new Promise((resolve, reject) => waitFor.then(() => {
        this.startDo(initiatorId, this.serviceStarter)
          .then(() => resolve())
          .catch((error) => reject(error));
      }))
      :
      this.startDo(initiatorId, this.serviceStarter);
  }

  startDo(initiatorId) {
    const starting = this.alreadyStarting;

    this.alreadyStarting = true;

    return starting ?
      new Promise((resolve) => {
        this.initiators.push(initiatorId);
        this.startOk(resolve);
      })
      :
      new Promise((resolve, reject) => { // eslint-disable-line
        if (!initiatorId) {
          reject(`Start service "${protoName(this)}" error. No initiator id.`);
        } else if (this.serviceStatus !== STATUS_SERVICE_SLEEP &&
          this.serviceStatus !== STATUS_SERVICE_STOPPED) {
          reject(`Start service "${protoName(this)}" error. 
                Wrong status "${this.serviceStatus}". Initiator - "${initiatorId}"`);
        } else {
          // auto bind
          if (this.getConfig().autoBind !== false) {
            this.bindApp();
          }
          return this.proceedService(initiatorId, ON_START,
            STATUS_SERVICE_STARTING, STATUS_SERVICE_STARTED).then(() => {
            resolve();
          }).catch((e) => {
            reject(e);
          });
        }
      }).then(() => {
        this.initiators.push(initiatorId);
        return new Promise((resolve) => {
          this.startOk(resolve);
        });
      }).catch((err) => {
        console.warn(err);
        return new Promise((resolve, reject) => { reject(err); });
      });
  }

  startOk(resolve) {
    if (this.serviceStarter) {
      this.serviceStarter.register(this);
    }

    resolve();
  }

  stop(initiatorId) {
    const stopping = this.alreadyStopping;

    return stopping
      ?
      new Promise((resolve) => {
        resolve();
      })
      :
      new Promise((resolve, reject) => {
        if (!initiatorId) {
          resolve();
        } else if (_.indexOf(this.initiators, initiatorId) === -1) {
          reject(`Stop service "${protoName(this)}" error. Initiator with id "${initiatorId}" not found.`);
        } else if (this.serviceStatus === STATUS_SERVICE_STARTED ||
          this.serviceStatus === STATUS_SERVICE_STARTING ||
          this.serviceStatus === STATUS_SERVICE_FAIL) {
          _.remove(this.initiators, n => n === initiatorId);

          resolve();
        } else {
          resolve(true);
        }
      }).then((alreadyStopped) => {
        let result = false;

        if ((alreadyStopped || this.initiators.length) && initiatorId) {
          result = new Promise((resolve) => {
            resolve(this.initiators.length);
          });
        } else {
          this.alreadyStopping = true;
          result = this.proceedService(initiatorId, ON_STOP, STATUS_SERVICE_STOPPING, STATUS_SERVICE_STOPPED);
        }

        return result;
      });
  }

  proceedService(id, fn, state1, state2) {
    const initiator = id || 'unknown';
    return new Promise((resolve, reject) => {
      const result = this[fn]();

      if (result instanceof Promise) {
        this.setServiceStatus(state1);

        result.then(() => {
          this.setServiceStatus(state2);
          resolve();
        }).catch((e) => {
          this.setServiceStatus(STATUS_SERVICE_FAIL, `${state1}_fail`);
          const error = typeof e === 'string' ? new Error(e) : e;
          e.serviceError = `Service:"${protoName(this)}", initing by "${initiator}" has status "${this.serviceFail}"`;
          reject(error);
        });
      } else if (result) {
        this.setServiceStatus(state2);
        resolve();
      } else {
        this.setServiceStatus(STATUS_SERVICE_FAIL, `${state1}_fail`);
        reject(new Error(`Service:"${protoName(this)}", initing by "${initiator}" has status "${this.serviceFail}"`));
      }
    });
  }

  setServiceFail(msg) {
    this.setServiceStatus(STATUS_SERVICE_FAIL, `${msg}_fail`);
  }

  setServiceStarted() {
    this.setServiceStatus(STATUS_SERVICE_STARTED);
  }

  setServiceStatus(status, failDesc) {
    this.alreadyStarting = status === STATUS_SERVICE_STARTING || status === STATUS_SERVICE_STARTED;
    this.serviceStatus = status;
    this.serviceReady = status === STATUS_SERVICE_STARTED;

    if (status === STATUS_SERVICE_STARTED) {
      this.serviceWasStarted = true;
      this.alreadyStopping = false;
    }

    if (failDesc) {
      this.serviceFail = failDesc;
    }
  }

  onStart() {
    return true;
  }

  onStop() {
    return true;
  }

  /**
   * Добавляет наблюдателя переменной, при необходимости именуется ключом
   * @public
   * @param {object} obsr
   * @param {string} key
   * @param {array} services
   * @returns {*|disposer}
   */

  addObserve(obsr, key, services) {
    let result;
    if (!services || !this.binder.addDisposer(this.getConfig().bindAs, services, obsr)) {
      this.disposers.push(obsr);

      if (this.disposerKeys[key]) {
        console.error(`Observer with key "${key}" already exists in the store ${protoName(this)}`);
        result = false;
      } else {
        if (key) {
          this.disposerKeys[key] = this.disposers.length - 1;
        }

        result = this.disposers[this.disposers.length - 1];
      }
    }

    return result;
  }

  addObservers(obsrs, services) {
    obsrs.forEach((obsr) => {
      this.addObserve(obsr, null, services);
    });
  }
  /**
   * Удаляет именованный ключом наблюдатель переменной
   * @public
   * @param {string} key
   */
  _removeObserve(key) {
    if (typeof this.disposerKeys[key] === 'undefined') {
      console.error(`Observer with key "${key}" not fount in the store ${protoName(this)}`);
      return false;
    }

    this.disposers[this.disposerKeys[key]]();
    this.disposers[this.disposerKeys[key]] = null;
    delete this.disposerKeys[key];
    return undefined;
  }

  /**
   * Привязывает стор к глобальному биндеру
   * @public
   * @param {object} bindData
   */
  bindApp() {
    if (Object.prototype.hasOwnProperty.call(this.getConfig(), 'bindAs')) {
      this.binder.bind(this, this.getConfig().importData);
    } else {
      console.warn(`Base Store. ${protoName(this)} has no bindAs in config`);
    }
  }
  /**
   * Отвязывает стор от глобального биндера
   * @public
   */
  unbindApp() {
    if (this.getConfig().bindAs) {
      this.binder.unbind(this);
    }
  }
  callApi(from, methodName, ...arg) {
    return this.binder.callApi(from, methodName, this.getConfig().bindAs, ...arg);
  }

  getConfig() {
    return this.config || {};
  }

  importVar(from, varName, raw) {
    return this.binder.importVar(from, varName, this.getConfig().bindAs, raw);
  }

  /**
   * Вызывается у сторов синглтонов в момент маунта компонента
   * @public
   */
  onMount() {

  }
  /**
   * Вызывается из коннектора в момент маунта компонента
   * @public
   */
  onMountInit() {
    if (!this.mounted) {
      this.onMount();
    }
    this.mounted = true;
  }
  /**
   * Отвязывает стор от зависимостей перед удалением
   * @public
   */
  destroy() {
    this.disposers.forEach((obsr) => {
      obsr();
    });
    this.unbindApp();
  }
}

