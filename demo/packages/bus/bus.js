// @flow

// lib
import Bus from 'rxjs-event-bus';

// const
// import { SIDE_BAR_EVENT_TYPES, PAIR_EVENT_NAMES, RATE_EVENT_NAMES } from './busTypes.js';

// type
//import type { BusAvailableEventsType } from './busTypes.js';
import { PLATFORM_EVENTS } from './busTypes.js';


const history = [
  [PLATFORM_EVENTS.CURRENT_ASSET, 1],
  [PLATFORM_EVENTS.CURRENT_PRICE, 1],
  [PLATFORM_EVENTS.CURRENT_BALANCE, 1],
];

const historySettings = new Map(history);

// eslint-disable-next-line
const bus: Bus<*> = new Bus(historySettings);

export default bus;
