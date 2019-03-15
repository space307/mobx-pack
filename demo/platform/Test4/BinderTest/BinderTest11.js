/* eslint-disable */
// @flow
import { Binder } from 'sources.js';


const binder = new Binder();
//const binderLocal = new Binder(binder);

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
  if (onUnbind) {
    config.onUnbind = onUnbind;
  }

  return config;
}

function createStore() {
  return {
    onBind1(...arg){
      console.log([this, 'onBind1', arg]);
    },
    onBind2(...arg){
      console.log([this, 'onBind2', arg]);
    },
    onUnbind1(...arg){
      console.log([this, 'onUnbind1', arg]);
    },
    onUnbind2(...arg){
      console.log([this, 'onUnbind2', arg]);
    },
  };
}



const store1 = createStore();
const store2 = createStore();
const store3 = createStore();


/*
binder.bind(store1, createConfig(s1, null, [[s2, s3, 'onUnbind1'], [s2, 'onUnbind2']]));
binder.bind(store2, createConfig(s2, null, [[s1, s3, 'onUnbind1'], [s1, 'onUnbind2']]));
binder.bind(store3, createConfig(s3, null, [[s2, s1, 'onUnbind1'], [s2, 'onUnbind2']]));
 */
binder.bind(store1, createConfig(s1, null, [[s2, s3, 'onUnbind1']]));
binder.bind(store2, createConfig(s2));
binder.bind(store3, createConfig(s3));

binder.unbind(s2);
binder.unbind(s3);


console.log(['binder', binder, store1]);
