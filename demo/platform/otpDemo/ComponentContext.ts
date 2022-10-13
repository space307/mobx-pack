import React from 'react';
import { Binder } from 'mobx-pack';

export const BinderContext = React.createContext<Binder>(new Binder());
export const ServiceContext = React.createContext({});
