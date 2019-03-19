// @flow
import React from 'react';
import { Binder } from 'sources.js';
import { initialState } from './Environment.js';


export const GlobalContext = { binder: new Binder(), initialState };
export const BinderContext: React$Context<*> = React.createContext();
export const ServiceContext: React$Context<?{[key:string]:*}> = React.createContext();

