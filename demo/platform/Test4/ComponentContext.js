// @flow
import React from 'react';



//export const GlobalContext = { binder: context.binder, initialState: {} };

export const BinderContext: React$Context<*> = React.createContext();
export const StoreContext: React$Context<?Array<*>> = React.createContext();
