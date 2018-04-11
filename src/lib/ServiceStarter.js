import _ from 'lodash';

export default class ServiceStarter {
  stratedServices = {};
  waiters = {};

  register(service) {
    const conf = service.getConfig();

    if (conf.bindAs) {
      this.stratedServices[conf.bindAs] = service;
    }
    this.processExpected(service);
  }

  waitFor(service) {
    let result = false;
    const conf = service.getConfig();
    let promises;
    let depsError;

    if (conf.waitFor && conf.waitFor.length) {
      depsError = this.chekDeps(conf.bindAs, conf.waitFor, this.waiters);

      if (!depsError) {
        promises = this.processWaiting(service);
        result = promises.length ? Promise.all(promises) : false;
      } else {
        console.error(`ServiceStarter error. "${conf.bindAs}": ${depsError}.`);
      }
    }

    return result;
  }

  processWaiting(service) {
    const conf = service.getConfig();
    let result = false;

    conf.waitFor.forEach((item) => {
      if (!this.stratedServices[item]) {
        if (!result) {
          result = [];
        }

        result.push(new Promise(
          (resolve, reject) => {
            this.addWaiter(service, item, resolve, reject);
          },
        ));
      }
    });
    return result;
  }
  processExpected(service) {
    const conf = service.getConfig();
    const waiters = this.waiters[conf.bindAs];
    if (waiters && waiters.length) {
      waiters.forEach((item) => {
        item.resolve();
      });
    }
  }

  addWaiter(waiterService, expected, resolve, reject) {
    if (!this.waiters[expected]) {
      this.waiters[expected] = [];
    }
    this.waiters[expected].push({ waiterService, resolve, reject });
  }
  /* eslint-disable */
  goByChain(hash, entry, currentPoint, chain) {
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
  chekDeps(bindAs, waitFor, waiters) {
    let result = false;
    const chain = {};
    const hash = {};

    if (waitFor.length) {
      _.each(waiters, (data, service) => {
        data.forEach((item) => {
          const conf = item.waiterService.getConfig();
          const waiterName = conf.bindAs;

          if (!hash[waiterName]) {
            hash[waiterName] = {};
          }
          hash[waiterName][service] = 1;
        });
      });

      if (!hash[bindAs]) {
        hash[bindAs] = {};
      }

      waitFor.forEach((item) => {
        hash[bindAs][item] = 1;
      });
    }

    _.each(hash, (data, point) => {
      const error = this.goByChain(hash, point, point, chain);
      if (error) {
        result = error;
      }
    });

    return result;
  }
}

