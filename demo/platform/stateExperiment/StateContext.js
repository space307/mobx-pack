// @flow
import React from 'react';
import type { IState } from './types.js';

const StateContext: React$Context<IState> = React.createContext();
export default StateContext;

