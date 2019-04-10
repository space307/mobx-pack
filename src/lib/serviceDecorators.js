// @flow

import type { ServiceConfigType } from './typing/common.js';

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


function createConfig(): ServiceConfigType {
  return {
    onStart: '',
    onStop: '',
    config: {
      bindAs: '',
      onBind: [],
      onUnbind: [],
    },
  };
}

function putServiceNamesToConfig(
  serviceNames: Array<string>,
  service: ServiceType,
  callbackName: string,
  optionName: string): void {
  const proto = service.constructor;
  if (!proto.binderConfig || !proto.binderConfig.config) {
    proto.binderConfig = createConfig();
  }

  if (serviceNames && serviceNames.length && callbackName) {
    serviceNames.forEach(
      (serviceName: string) => {
        if (!validateName(serviceName)) {
          throw new Error(`Wrong service name "${serviceName}" 
          passed to function "${callbackName}" decorator (service:${proto.name}).`);
        }
      },
    );

    proto.binderConfig.config[optionName].push(
      [...serviceNames,
        callbackName],
    );
  }
}


function putMethodNameToConfig(service: ServiceType, callbackName: string, optionName: string): void {
  const proto = service.constructor;
  if (!proto.binderConfig) {
    proto.binderConfig = createConfig();
  }
  proto.binderConfig[optionName] = callbackName;
}


export function bindAs(serviceName: string): (service: ServiceType) => ServiceType {
  if (typeof serviceName === 'function') {
    throw new Error(`Wrong attributes passed to bindAs decorator (service:${serviceName.name}).`);
  }
  return (service: ServiceType): ServiceType => {
    if (!validateName(serviceName)) {
      throw new Error(`Wrong name "${serviceName}" passed to bindAs decorator (service:${service.name}).`);
    }

    if (!service.binderConfig || !service.binderConfig.config) {
      service.binderConfig = createConfig();
    }
    service.binderConfig.config.bindAs = serviceName;
    return service;
  };
}


export function bindServices(
  ...serviceNames: Array<string>
): (service: ServiceType, callbackName: string) => ServiceType {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to bindServices decorator (${serviceNames.join(',')}).`);
  }

  return (service: ServiceType, callbackName: string): ServiceType => {
    putServiceNamesToConfig(serviceNames, service, callbackName, 'onBind');
    return service;
  };
}

export function unbindServices(
  ...serviceNames: Array<string>
): (service: ServiceType, callbackName: string) => ServiceType {
  if (!serviceNames.length || !validateNameList(serviceNames)) {
    throw new Error(`Wrong attributes passed to unbindServices decorator (${serviceNames.join(',')}).`);
  }
  return (service: ServiceType, callbackName: string): ServiceType => {
    putServiceNamesToConfig(serviceNames, service, callbackName, 'onUnbind');
    return service;
  };
}


export function onStart(service: ServiceType, callbackName: string): ServiceType {
  putMethodNameToConfig(service, callbackName, 'onStart');
  return service;
}

export function onStop(service: ServiceType, callbackName: string): ServiceType {
  putMethodNameToConfig(service, callbackName, 'onStop');
  return service;
}
