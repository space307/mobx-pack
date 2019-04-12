// @flow

import type { BinderConfigType } from './typing/common.js';

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

function putServiceNamesToConfig(
  serviceNames: Array<string>,
  service: ServiceType,
  callbackName: string,
  optionName: string,
  pushToArray: boolean = true,
): void {
  const proto = service.constructor;
  if (!proto.binderConfig) {
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

    if (pushToArray) {
      proto.binderConfig[optionName].push(
        [...serviceNames,
          callbackName],
      );
    } else {
      proto.binderConfig[optionName] = [...serviceNames,
        callbackName];
    }
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

    if (!service.binderConfig) {
      service.binderConfig = createConfig();
    }
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
    putServiceNamesToConfig(serviceNames, service, callbackName, 'onBind');
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
    putServiceNamesToConfig(serviceNames, service, callbackName, 'onUnbind');
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
    putServiceNamesToConfig(serviceNames, service, callbackName, 'onStart', false);
    return service;
  };
}


export function onStop(service: ServiceType, callbackName: string): ServiceType {
  putMethodNameToConfig(service, callbackName, 'onStop');
  return service;
}
