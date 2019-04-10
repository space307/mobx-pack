// @flow

import { createProvider, createBinderProvider } from 'sources.js';

import { BinderContext, ServiceContext } from './ComponentContext.js';

export const Provider = createProvider(BinderContext, ServiceContext);
export const BinderProvider = createBinderProvider(BinderContext);

