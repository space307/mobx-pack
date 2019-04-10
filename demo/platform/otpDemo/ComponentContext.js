// @flow
import React from 'react';
import { Binder } from 'sources.js';
import type { ServiceInterfaces } from './typing/types.js';

type BinderContextType = ?{ binder: Binder, initialState: * };

export const BinderContext: React$Context<BinderContextType> = React.createContext();
export const ServiceContext: React$Context<ServiceInterfaces> = React.createContext();
