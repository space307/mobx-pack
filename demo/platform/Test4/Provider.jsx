// @flow

import { CreateProvider, CreateBinderProvider } from 'sources.js';

import { BinderContext, StoreContext } from './ComponentContext.js';

export const Provider = CreateProvider(BinderContext, StoreContext);
export const BinderProvider = CreateBinderProvider(BinderContext);

