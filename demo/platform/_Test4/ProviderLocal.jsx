// @flow

//import { CreateProvider } from 'sources.js';
import { BinderContext, StoreContext } from './ComponentContext.js';
import CreateProvider from './Provider.jsx';




const ProviderLocal = CreateProvider(BinderContext, StoreContext);

console.log(['BinderContext!!', BinderContext, ProviderLocal]);


export default ProviderLocal;
