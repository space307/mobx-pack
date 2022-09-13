// @flow
import React from 'react';
import { Binder } from 'mobx-pack';
import type { ServiceInterfaces } from './typing/types.js';

type BinderContextType = ?{ binder: Binder, initialState: * };

export const BinderContext: React$Context<BinderContextType> = React.createContext();
export const ServiceContext: React$Context<ServiceInterfaces> = React.createContext();
