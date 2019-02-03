// @flow

// lib
import Bus from 'rxjs-event-bus';

// const
//import { SIDE_BAR_EVENT_TYPES, PAIR_EVENT_NAMES, RATE_EVENT_NAMES } from './busTypes.js';

// type
import type { BusAvailableEventsType } from './busTypes.js';


/*const history = [
  [SIDE_BAR_EVENT_TYPES.IS_COLLAPSED, 1],
  [PAIR_EVENT_NAMES.CURRENT_PAIR, 1],
  [RATE_EVENT_NAMES.CURRENT_RATE, 1],
];*/

const historySettings = new Map([]);

// eslint-disable-next-line
const bus: Bus<BusAvailableEventsType> = new Bus(historySettings);

export default bus;
