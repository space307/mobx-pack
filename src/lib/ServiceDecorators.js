// @flow
type StoreType = Class<*>;
function validateName(name) {
  return /^[A-Za-z][A-Za-z0-9_]+$/.test(name);
}

function createConfig() {
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
  store: StoreType,
  callbackName: string,
  optionName: string): void {
  const proto = store.constructor;
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


function putMethodNameToConfig(store: StoreType, callbackName: string, optionName: string): void {
  const proto = store.constructor;
  if (!proto.binderConfig) {
    proto.binderConfig = createConfig();
  }
  proto.binderConfig[optionName] = callbackName;
}


export function bindAs(storeName: string): (store: StoreType) => StoreType {
  return (store: StoreType): StoreType => {
    if (!validateName(storeName)) {
      throw new Error(`Wrong name "${storeName}" passed to bindAs decorator (service:${store.name}).`);
    }

    if (!store.binderConfig || !store.binderConfig.config) {
      store.binderConfig = createConfig();
    }
    store.binderConfig.config.bindAs = storeName;
    return store;
  };
}


export function bindServices(
  serviceNames: Array<string>,
): (store: StoreType, callbackName: string) => StoreType {
  return (store: StoreType, callbackName: string): StoreType => {
    putServiceNamesToConfig(serviceNames, store, callbackName, 'onBind');
    return store;
  };
}

export function unbindServices(
  serviceNames: Array<string>,
): (store: StoreType, callbackName: string) => StoreType {
  return (store: StoreType, callbackName: string): StoreType => {
    putServiceNamesToConfig(serviceNames, store, callbackName, 'onUnbind');
    return store;
  };
}


export function onStart(store: StoreType, callbackName: string) {
  putMethodNameToConfig(store, callbackName, 'onStart');
  return store;
}

export function onStop(store: StoreType, callbackName: string) {
  putMethodNameToConfig(store, callbackName, 'onStop');
  return store;
}


/* @bindAs('TestStore')
class Test {
  @onStart
  onStart() {

  }

  @bindServices(['ImportantService'])
  onBind() {

  }
  @bindServices(['ImportantService2'])
  onBindService2() {

  }
  @unbindServices(['ImportantService2'])
  onUnbind() {

  }

  @onStop
  onStop() {

  }
} */

