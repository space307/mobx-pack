import type { BaseStore } from './BaseStore';
import type { ServiceConfigBindAs } from './typing/common';

type StartResult = boolean | boolean[];

type Waiter = {
  waiterService: BaseStore;
  resolve: (result: boolean) => void;
  reject: (error: Error) => void;
};

export class ServiceStarter {
  private startedServices: Record<string, any> = {};

  private waiters: Record<ServiceConfigBindAs, Waiter[]> = {};

  register(service: BaseStore) {
    const conf = service.getConfig();

    if (conf.bindAs) {
      this.startedServices[conf.bindAs] = service;
    }
    this.processExpected(service);
  }

  waitFor(service: BaseStore): false | Promise<StartResult> {
    const conf = service.getConfig();

    if (conf.bindAs && conf.waitFor && conf.waitFor.length) {
      const depsError = this.checkDeps(conf.bindAs, conf.waitFor, this.waiters);

      if (!depsError) {
        const promises = this.processWaiting(service);
        return Array.isArray(promises) ? Promise.all(promises) : false;
      }
      console.error(
        `ServiceStarter error. "${conf.bindAs ?? 'unknown'}": ${depsError.toString()}.`,
      );
    }

    return false;
  }

  processWaiting(service: BaseStore): false | Promise<boolean> {
    const conf = service.getConfig();
    let result: false | Promise<boolean>[] = false;

    conf.waitFor?.forEach(item => {
      if (!this.startedServices[item]) {
        if (!result) {
          result = [];
        }

        if (Array.isArray(result)) {
          result.push(
            new Promise<boolean>((resolve, reject) => {
              this.addWaiter(service, item, resolve, reject);
            }),
          );
        }
      }
    });

    return result;
  }

  processExpected(store: BaseStore) {
    const conf = store.getConfig();
    if (!conf.bindAs) {
      return;
    }
    const waiters = this.waiters[conf.bindAs];
    if (waiters && waiters.length) {
      waiters.forEach(item => {
        item.resolve(true);
      });
    }
  }

  addWaiter(
    waiterService: BaseStore,
    expected: ServiceConfigBindAs,
    resolve: (result: boolean) => void,
    reject: (err: Error) => void,
  ) {
    if (!this.waiters[expected]) {
      this.waiters[expected] = [];
    }
    this.waiters[expected].push({ waiterService, resolve, reject });
  }

  /* eslint-disable */
  goByChain(
    hash: Record<string, Record<string, unknown>>,
    entry: string,
    currentPoint: string,
    chain: Record<string, number>,
  ): string | void {
    if (!chain[currentPoint]) {
      chain[currentPoint] = 1;
      for (const point in hash[currentPoint]) {
        if (!hash[currentPoint].hasOwnProperty(point)) {
          continue;
        }
        if (point !== entry) {
          return this.goByChain(hash, entry, point, chain);
        }

        return `Loading conflict with"${entry}"`;
      }
    }
  }

  /* eslint-enable */
  checkDeps(
    bindAs: ServiceConfigBindAs,
    waitFor: ServiceConfigBindAs[],
    waiters: Record<ServiceConfigBindAs, Waiter[]>,
  ): string | boolean {
    let result: string | boolean = false;
    const chain = {};
    const hash: Record<string, Record<string, number>> = {};

    if (waitFor.length) {
      Object.entries(waiters).forEach(([service, data]) => {
        data.forEach(item => {
          const conf = item.waiterService.getConfig();
          const waiterName = conf.bindAs ?? 'unknown';

          if (!hash[waiterName]) {
            hash[waiterName] = {};
          }
          hash[waiterName][service] = 1;
        });
      });

      if (!hash[bindAs]) {
        hash[bindAs] = {};
      }

      waitFor.forEach(item => {
        hash[bindAs][item] = 1;
      });
    }

    Object.keys(hash).forEach(point => {
      const error = this.goByChain(hash, point, point, chain);
      if (error) {
        result = error;
      }
    });

    return result;
  }
}
