/* eslint-disable */
// @flow
import { Binder } from 'sources.js';
import {bindAs, onStart, startService} from "sources";


const s1 = 's1';
const s2 = 's2';
const s3 = 's3';
const s4 = 's4';

function getConfig(ServiceProto) {
  const serviceStartConfigData = {
    proto: ServiceProto,
    protoAttrs: [1, 2],
    binderConfig: ServiceProto.binderConfig,
  };

  return serviceStartConfigData;
}





const storeName = 'test';

@bindAs(storeName)
class ServiceProto {
  @onStart
  onStart() {
    return true;
  }
}

const initialState = {};

const binder = new Binder();
startService(getConfig(ServiceProto), binder, initialState).then(({ service, started, serviceStartConfig }) => {
  console.log([11111, service, started, serviceStartConfig]);
});


