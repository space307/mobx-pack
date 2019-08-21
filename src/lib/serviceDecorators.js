// @flow
import { cloneDeep, last } from 'lodash';
import type { BinderConfigType, ServiceConfigCallbackSetType } from './typing/common.js';

type ServiceType = Class<*>;


function validateName(name: string): boolean {
  return !!(name && typeof name === 'string' && /^[A-Za-z][A-Za-z0-9_]+$/.test(name));
}
function validateNameList(list: Array<string>): boolean {
  return list.reduce((acc, item) => {
    if (!validateName(item)) {
      acc = false;
    }
    return acc;
  }, true);
}

function createConfig(): BinderConfigType {
  return {
    onStart: [],
    onStop: '',
    bindAs: '',
    onBind: [],
    onUnbind: [],
  };
}

function prepareConfig(service: ServiceType): void {
  if (!service.binderConfig) {
    service.binderConfig = createConfig();
  } else {
    service.binderConfig = cloneDeep(service.binderConfig);
  }
}

function putServiceNamesToConfig(
  serviceNames: Array<string>,
  service: ServiceType,
  callbackName: string,
  optionName: string,
  pushToArray: boolean = true,
): void {
  if (serviceNames && serviceNames.length && callbackName) {
    serviceNames.forEach(
      (serviceName: string) => {
        if (!validateName(serviceName)) {
          throw new Error(`Wrong service name "${serviceName}" 
          passed to function "${callbackName}" decorator (service:${service.name}).`);
        }
      },
    );

    if (pushToArray) {
      const existCallback = service.binderConfig[optionName].find(
        (callback: ServiceConfigCallbackSetType): boolean => last(callback) === callbackName,
      );

      if (existCallback === undefined) {
        service.binderConfig[optionName].push(
          [...serviceNames, callbackName],
        );
      } else {
        existCallback.splice(0, existCallback.length, ...serviceNames, callbackName);
      }
    } else {
      service.binderConfig[optionName] = [...serviceNames, callbackName];
    }
  }
}


function putMethodNameToConfig(service: ServiceType, callbackName: string, optionName: string): void {
  service.binderConfig[optionName] = callbackName;
}


export function bindAs(serviceName: string): (service: ServiceType) => ServiceType {
  if (typeof serviceName === 'function') {
    throw new Error(`Wrong attributes passed to bindAs decorator (service:${serviceName.name}).`);
  }
  return (service: ServiceType): ServiceType => {
    if (!validateName(serviceName)) {
      throw new Error(`Wrong name "${serviceName}" passed to bindAs decorator (service:${service.name}).`);
    }

    prepareConfig(service);

    service.binderConfig.bindAs = serviceName;
    return service;
  };
}


export function onBind(
  ...serviceNames: Array<string>
): (service: ServiceType, callbackName: string) => ServiceType {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to onBind decorator (${serviceNames.join(',')}).`);
  }

  return (service: ServiceType, callbackName: string): ServiceType => {
    const proto = service.constructor;
    prepareConfig(proto);

    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onBind');
    return service;
  };
}

export function onUnbind(
  ...serviceNames: Array<string>
): (service: ServiceType, callbackName: string) => ServiceType {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to onUnbind decorator (${serviceNames.join(',')}).`);
  }
  return (service: ServiceType, callbackName: string): ServiceType => {
    const proto = service.constructor;
    prepareConfig(proto);

    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onUnbind');
    return service;
  };
}


export function onStart(
  ...serviceNames: Array<string>
): (service: ServiceType, callbackName: string) => ServiceType {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to onStart decorator (${serviceNames.join(',')}).`);
  }
  return (service: ServiceType, callbackName: string): ServiceType => {
    const proto = service.constructor;
    prepareConfig(proto);

    putServiceNamesToConfig(serviceNames, proto, callbackName, 'onStart', false);
    return service;
  };
}


export function onStop(service: ServiceType, callbackName: string): ServiceType {
  const proto = service.constructor;
  prepareConfig(proto);

  putMethodNameToConfig(proto, callbackName, 'onStop');
  return service;
}
