/**
 отличия от боевого файла:
 - ворзвращается не функция а класс принимающий объект context
 - поле appBinder переименовано в биндер
 */
import { makeObservable, observable } from 'mobx';
import type { Binder } from './Binder';
import { protoName } from './helper/util.js';
import type { ServiceStarter } from './ServiceStarter';
import type { ServiceConfigBindAs, BindableEntity, BindableEntityConfig } from './typing/common.js';

export enum ServiceStatus {
  sleep,
  starting,
  started,
  stopping,
  stopped,
  fail,
}

const ON_START = 'onStart';
const ON_STOP = 'onStop';

export type StoreContext = { binder: Binder; serviceStarter: ServiceStarter };

export class BaseStore implements BindableEntity {
  config: BindableEntityConfig = {};

  api = {};

  disposers: (() => void)[] = [];

  disposerKeys: Record<string, unknown> = {};

  binder: Binder;

  mounted = false;

  serviceStatus = ServiceStatus.sleep;

  serviceReady = false;

  serviceWasStarted = false;

  serviceFail = null;

  alreadyStarting = false;

  alreadyStopping = false;

  initiators: string[] = [];

  serviceStarter: ServiceStarter;

  static instance: BaseStore | null = null;

  constructor(context: StoreContext) {
    this.binder = context.binder;
    this.serviceStarter = context.serviceStarter;

    makeObservable(this, {
      serviceStatus: observable,
      serviceReady: observable,
      serviceWasStarted: observable,
    });
  }

  start(initiatorId: string) {
    const waitFor = this.serviceStarter.waitFor(this);
    return waitFor ? waitFor.then(() => this.startDo(initiatorId)) : this.startDo(initiatorId);
  }

  startDo(initiatorId?: string): Promise<void> {
    const initiator = initiatorId ?? 'unknown';
    const starting = this.alreadyStarting;

    this.alreadyStarting = true;

    return starting
      ? new Promise<void>(resolve => {
          this.initiators.push(initiator);
          this.startOk(resolve);
        })
      : new Promise<void>((resolve, reject) => {
          // eslint-disable-line
          if (
            this.serviceStatus !== ServiceStatus.sleep &&
            this.serviceStatus !== ServiceStatus.stopped
          ) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(`Start service "${protoName(this)}" error.
                Wrong status "${this.serviceStatus}". Initiator - "${initiator}"`);
          } else {
            // auto bind
            if (this.getConfig().autoBind !== false) {
              this.bindApp();
            }

            this.proceedService(
              initiatorId,
              ON_START,
              ServiceStatus.starting,
              ServiceStatus.started,
            )
              .then(resolve)
              .catch(reject);
          }
        }).then(() => {
          this.initiators.push(initiator);
          return new Promise(resolve => {
            this.startOk(resolve);
          });
        });
  }

  startOk(resolve: () => void) {
    if (this.serviceStarter) {
      this.serviceStarter.register(this);
    }

    resolve();
  }

  stop(initiatorId: string) {
    const stopping = this.alreadyStopping;

    return stopping
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
          if (!initiatorId) {
            resolve();
          } else if (this.initiators.indexOf(initiatorId) === -1) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(
              `Stop service "${protoName(
                this,
              )}" error. Initiator with id "${initiatorId}" not found.`,
            );
          } else if (
            this.serviceStatus === ServiceStatus.started ||
            this.serviceStatus === ServiceStatus.starting ||
            this.serviceStatus === ServiceStatus.fail
          ) {
            this.initiators = this.initiators.filter(n => n !== initiatorId);

            resolve();
          } else {
            resolve(true);
          }
        }).then(alreadyStopped => {
          let result = false;

          if ((alreadyStopped || this.initiators.length) && initiatorId) {
            result = new Promise(resolve => {
              resolve(this.initiators.length);
            });
          } else {
            this.alreadyStopping = true;
            result = this.proceedService(
              initiatorId,
              ON_STOP,
              ServiceStatus.stopping,
              ServiceStatus.stopped,
            );
          }

          return result;
        });
  }

  proceedService(id, fn, state1, state2): Promise<void> {
    const initiator = id || 'unknown';
    return new Promise((resolve, reject) => {
      const result = this[fn]();

      if (result instanceof Promise) {
        this.setServiceStatus(state1);

        result
          .then(() => {
            this.setServiceStatus(state2);
            resolve();
          })
          .catch(e => {
            this.setServiceStatus(ServiceStatus.fail, `${state1}_fail`);
            const error = typeof e === 'string' ? new Error(e) : e;
            e.serviceError = `Service:"${protoName(this)}", initing by "${initiator}" has status "${
              this.serviceFail
            }"`;
            reject(error);
          });
      } else if (result) {
        this.setServiceStatus(state2);
        resolve();
      } else {
        this.setServiceStatus(ServiceStatus.fail, `${state1}_fail`);
        reject(
          new Error(
            `Service:"${protoName(this)}", initing by "${initiator}" has status "${
              this.serviceFail
            }"`,
          ),
        );
      }
    });
  }

  setServiceFail(msg: string) {
    this.setServiceStatus(ServiceStatus.fail, `${msg}_fail`);
  }

  setServiceStarted() {
    this.setServiceStatus(ServiceStatus.started);
  }

  setServiceStatus(status, failDesc) {
    this.alreadyStarting = status === ServiceStatus.starting || status === ServiceStatus.started;
    this.serviceStatus = status;
    this.serviceReady = status === ServiceStatus.started;

    if (status === ServiceStatus.started) {
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
    // TODO придумать как выпилить this.getConfig()
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
    obsrs.forEach(obsr => {
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
    const config = this.getConfig();

    if (Object.prototype.hasOwnProperty.call(config, 'bindAs')) {
      if (!this.binder.isBind(config.bindAs)) {
        this.binder.bind(this, config);
      }
    } else {
      console.warn(`Base Store. ${protoName(this)} has no bindAs in config`);
    }
  }

  /**
   * Отвязывает стор от глобального биндера
   * @public
   */
  unbindApp() {
    const { bindAs } = this.getConfig();
    if (bindAs) {
      this.binder.unbind(bindAs);
    }
  }

  callApi(from: ServiceConfigBindAs, methodName: string, ...arg: unknown[]) {
    const { bindAs } = this.getConfig();
    return this.binder?.callApi(from, methodName, bindAs ?? 'unknown', ...arg);
  }

  getConfig(): BindableEntityConfig {
    return this.config;
  }

  importVar(from: ServiceConfigBindAs, varName: string, raw: boolean) {
    const { bindAs } = this.getConfig();
    return this.binder?.importVar(from, varName, bindAs ?? 'unknown', raw);
  }

  /**
   * Вызывается у сторов синглтонов в момент маунта компонента
   * @public
   */
  onMount() {}

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
    this.disposers.forEach(obsr => obsr());
    this.unbindApp();

    if (this.constructor.instance) {
      this.constructor.instance = null;
    }
  }
}
