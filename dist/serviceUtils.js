"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startServices = startServices;
exports.stopServices = stopServices;
exports.getStartedServices = getStartedServices;

function startServices(binder, serviceStartConfigList) {
  return Promise.all(serviceStartConfigList.map(function (serviceStartConfig) {
    return binder.start(serviceStartConfig);
  }));
}

function stopServices(binder, serviceStartConfigList) {
  if (!serviceStartConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }

  serviceStartConfigList.forEach(function (ServiceProto) {
    binder.stop(ServiceProto);
  });
}

function getStartedServices(binder, serviceStartConfigList) {
  var services = [];
  serviceStartConfigList.forEach(function (ServiceProto) {
    var bindAs = ServiceProto.binderConfig.bindAs;
    var service = binder.getService(bindAs);

    if (service) {
      services.push(service);
    }
  });
  return services.length === serviceStartConfigList.length ? services : null;
}
//# sourceMappingURL=serviceUtils.js.map