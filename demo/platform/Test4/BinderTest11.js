/* eslint-disable */
// @flow
import { Binder } from 'sources.js';


const binder = new Binder();
const binderLocal = new Binder(binder);

const s1 = 's1';
const s2 = 's2';
const s3 = 's3';
const s4 = 's4';

function createConfig(bindAs, onBind, onUnbind) {
  const config = {
    bindAs,
  };

  if (onBind) {
    config.onBind = onBind;
  }
  if (onBind) {
    config.onUnbind = onUnbind;
  }

  return config;
}

const store1 = { onBindS1_23(a, b){
  console.log(['onBindS1_23', a, b]);
  }, onBindS1_3(){
    console.log(['onBindS1_3']);
  } };
const store2 = { onBindS2_13(){}, onBindS2_1(){} };
const store3 = { onBindS3_23(){}, onBindS3_3(){} };

binder.bind(store1, createConfig(s1, [[s2, s3, 'onBindS1_23'], [s3, 'onBindS1_3']]));
binder.bind(store2, createConfig(s2));
binder.bind(store3, createConfig(s3));
