// @flow

import { createProvider, createBinderProvider } from 'mobx-pack';

import { BinderContext, ServiceContext } from './ComponentContext.js';

export const Provider = createProvider(BinderContext, ServiceContext);
export const BinderProvider = createBinderProvider(BinderContext);

