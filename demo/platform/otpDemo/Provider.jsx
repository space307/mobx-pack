// @flow

import { CreateProvider, CreateBinderProvider } from 'sources.js';

import { BinderContext, ServiceContext } from './ComponentContext.js';

export const Provider = CreateProvider(BinderContext, ServiceContext);
export const BinderProvider = CreateBinderProvider(BinderContext);

