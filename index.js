const modules = {
  Binder: require('./lib/Binder').default,
  ServiceStarter: require('./lib/ServiceStarter').default,
  BaseStore: require('./lib/BaseStore').default,
  BaseComponent: require('./lib/BaseComponent').default,
  Connector: require('./lib/Connector').default,
  ServiceConnector: require('./lib/ServiceConnector').default,
};

exports.Binder = modules.Binder;
exports.ServiceStarter = modules.ServiceStarter;
exports.BaseStore = modules.BaseStore;
exports.BaseComponent = modules.BaseComponent;
exports.Connector = modules.Connector;
exports.ServiceConnector = modules.ServiceConnector;

module.exports = modules;

//test commit;
