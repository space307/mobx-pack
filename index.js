/* eslint-disable global-require */

const modules = {
  Binder: require('./dist/Binder').default,
  ServiceStarter: require('./dist/ServiceStarter').default,
  BaseStore: require('./dist/BaseStore').default,
  BaseComponent: require('./dist/BaseComponent').default,
  Connector: require('./dist/Connector').default,
  ServiceConnector: require('./dist/ServiceConnector').default,
  serviceUtils: require('./dist/serviceUtils'),
  startService: require('./dist/serviceUtils').startService,
  startServices: require('./dist/serviceUtils').startServices,
  stopService: require('./dist/serviceUtils').stopService,
  stopServices: require('./dist/serviceUtils').stopServices,
  Provider: require('./dist/Provider').default,
  BinderProvider: require('./dist/BinderProvider').default,
  serviceDecorators: require('./dist/serviceDecorators'),
  bindAs: require('./dist/serviceDecorators').bindAs,
  bindServices: require('./dist/serviceDecorators').bindServices,
  unbindServices: require('./dist/serviceDecorators').unbindServices,
  onStart: require('./dist/serviceDecorators').onStart,
  onStop: require('./dist/serviceDecorators').onStop,
};

exports.Binder = modules.Binder;
exports.ServiceStarter = modules.ServiceStarter;
exports.BaseStore = modules.BaseStore;
exports.BaseComponent = modules.BaseComponent;
exports.Connector = modules.Connector;

exports.ServiceConnector = modules.ServiceConnector;
exports.Provider = modules.Provider;
exports.BinderProvider = modules.BinderProvider;
exports.serviceUtils = modules.serviceUtils;
exports.startService = modules.startService;
exports.startServices = modules.startServices;
exports.stopService = modules.stopService;
exports.stopServices = modules.stopServices;
exports.serviceDecorators = modules.serviceDecorators;

module.exports = modules;

