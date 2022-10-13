import { cloneDeep, last } from 'lodash';
import type {
  BindableEntity,
  BindableEntityConstructor,
  BinderConfig,
  Constructor,
  ServiceConfigCallbackSet,
} from './typing/common.js';

function validateName(name: string): boolean {
  return !!(name && typeof name === 'string' && /^[A-Za-z][A-Za-z0-9_]+$/.test(name));
}

function validateNameList(list: string[]): boolean {
  return list.reduce((acc, item) => {
    if (!validateName(item)) {
      acc = false;
    }
    return acc;
  }, true);
}

function createConfig(): BinderConfig {
  return {
    onStart: [],
    onStop: '',
    bindAs: '',
    onBind: [],
    onUnbind: [],
  };
}

function prepareConfig<T extends Constructor>(ctr: T): T & BindableEntityConstructor {
  const bindableCtr = ctr as unknown as T & BindableEntityConstructor;

  if (!bindableCtr.binderConfig) {
    bindableCtr.binderConfig = createConfig();
  } else {
    bindableCtr.binderConfig = cloneDeep(bindableCtr.binderConfig);
  }

  return bindableCtr;
}

function putServiceNamesToConfig(
  names: string[],
  ctr: BindableEntityConstructor,
  callbackName: string,
  optionName: keyof Pick<BinderConfig, 'onStart' | 'onBind' | 'onUnbind'>,
): void {
  if (names && names.length && callbackName) {
    names.forEach((serviceName: string) => {
      if (!validateName(serviceName)) {
        throw new Error(`Wrong service name "${serviceName}"
          passed to function "${callbackName}" decorator (service:${ctr.name ?? 'unknown'}).`);
      }
    });

    if (!ctr.binderConfig) {
      throw new Error(`binderConfig not found! (service:${ctr.name ?? 'unknown'}).`);
    }

    if (optionName === 'onBind' || optionName === 'onUnbind') {
      const option = ctr.binderConfig[optionName];

      if (option) {
        const existCallback = option.find(
          (callback: ServiceConfigCallbackSet): boolean => last(callback) === callbackName,
        );

        if (existCallback === undefined) {
          option.push([...names, callbackName]);
        } else {
          existCallback.splice(0, existCallback.length, ...names, callbackName);
        }
      }
    } else {
      ctr.binderConfig[optionName] = [...names, callbackName];
    }
  }
}

function putMethodNameToConfig(
  ctr: BindableEntityConstructor,
  callbackName: string,
  optionName: keyof Pick<BinderConfig, 'onStop'>,
): void {
  if (ctr.binderConfig) {
    ctr.binderConfig[optionName] = callbackName;
  }
}

export function bindAs(
  name: string,
): <T extends object>(ctr: Constructor<T>) => BindableEntityConstructor<T & BindableEntity> {
  if (typeof name === 'function') {
    throw new Error(
      `Wrong attributes passed to bindAs decorator (service:${(name as () => unknown).name}).`,
    );
  }
  return ctr => {
    if (!validateName(name)) {
      throw new Error(
        `Wrong name "${name}" passed to bindAs decorator (service:${ctr.name ?? 'unknown'}).`,
      );
    }

    const bindedCtr = prepareConfig(ctr);
    bindedCtr.binderConfig.bindAs = name;

    return bindedCtr;
  };
}

export function onBind<T extends object>(
  ...serviceNames: string[]
): (service: T, callbackName: string) => void {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to onBind decorator (${serviceNames.join(',')}).`);
  }

  return (service, callbackName) => {
    const proto = service.constructor as BindableEntityConstructor;
    prepareConfig(proto);

    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onBind');
  };
}

export function onUnbind<T extends object>(
  ...serviceNames: string[]
): (service: T, callbackName: string) => T {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to onUnbind decorator (${serviceNames.join(',')}).`);
  }
  return (service, callbackName) => {
    const proto = service.constructor as BindableEntityConstructor;
    prepareConfig(proto);

    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onUnbind');
    return service;
  };
}

export function onStart<T extends object>(
  ...serviceNames: string[]
): (service: T, callbackName: string) => T {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to onStart decorator (${serviceNames.join(',')}).`);
  }
  return (service, callbackName) => {
    const proto = service.constructor as BindableEntityConstructor;
    prepareConfig(proto);

    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onStart');
    return service;
  };
}

export function onStop<T extends object>(service: T, callbackName: string): void {
  const proto = service.constructor as BindableEntityConstructor;
  prepareConfig(proto);
  putMethodNameToConfig(proto, callbackName, 'onStop');
}
