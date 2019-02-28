import { cloneDeep } from 'lodash';

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

function bindAs(storeName: string, config?:*): (store: *) => * {
  return (store: *): * => {
    console.log(['bindAs']);
    if (config) {
      store.binderConfig = cloneDeep(config);
    } else if (!store.binderConfig) {
      store.binderConfig = createConfig();
    }
    store.binderConfig.config.bindAs = storeName;
    return store;
  };
}


function bindServicesBehaviour(serviceNames: Array<string>, store: *, callbackName: string, optionName: string): void {
  const proto = store.constructor;
  if (!proto.binderConfig) {
    proto.binderConfig = createConfig();
  }

  if (serviceNames && serviceNames.length && callbackName) {
    proto.binderConfig.config[optionName].push(
      [...serviceNames,
        callbackName],

    );
  }
}


function bindServices(
  serviceNames: Array<string>,
): (store: *, callbackName: string) => * {
  return (store: *, callbackName: string): * => {
    bindServicesBehaviour(serviceNames, store, callbackName, 'onBind');
    return store;
  };
}

function unbindServices(
  serviceNames: Array<string>,
): (store: *, callbackName: string) => * {
  return (store: *, callbackName: string): * => {
    bindServicesBehaviour(serviceNames, store, callbackName, 'onUnbind');
    return store;
  };
}


@bindAs('TestStore')
class Test {
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
}

export default {};


console.log(['Class', Test, Test.binderConfig.config]);
