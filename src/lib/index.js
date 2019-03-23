// -@flow
import { startService, startServices, stopService, stopServices } from './serviceUtils.js';
import { onStop, onStart, unbindServices, bindServices, bindAs } from './serviceDecorators.js';
import Binder from './Binder.js';

/*
const b = new Binder();

@bindAs('sdsdsd')
class ServiceProto {
 // static binderConfig;
  @onStart
  onStart() {
    return new Promise(
      (resolve) => {
        setTimeout(() => { resolve(); });
      },
    );
  }
}

const serviceStartConfigData = {
  proto: ServiceProto,
  protoAttrs: [1, 2],
  binderConfig: {
    onStart: 'rrr',
    onStop: 'sss',
    config: {
      bindAs: 'sdsd',
      onBind: [
        ['rrrrr', 'onBind'],
      ],
    },
  },
};

stopService(b, serviceStartConfigData);
*/


export BaseComponent from './BaseComponent.js';
export BaseStore from './BaseStore.js';
export Binder from './Binder.js';
export Connector from './Connector.js';
export ServiceStarter from './ServiceStarter.js';
export ServiceConnector from './ServiceConnector.js';
export createProvider from './Provider.js';
export createBinderProvider from './BinderProvider.js';

export { startService, startServices, stopService, stopServices } from './serviceUtils.js';
export { onStop, onStart, unbindServices, bindServices, bindAs } from './serviceDecorators.js';
