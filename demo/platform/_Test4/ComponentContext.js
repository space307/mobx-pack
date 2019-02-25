// @flow
import React from 'react';
import { Binder } from 'sources.js';
import { initialState } from './Enviroment.js';


export const GlobalContext = { binder: new Binder(), initialState };
export const BinderContext: React$Context<*> = React.createContext(GlobalContext);
export const StoreContext: React$Context<?Array<*>> = React.createContext();

