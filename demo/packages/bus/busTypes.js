// @flow

/*import type { AssistantEventTypes } from 'widgets/assistant/constants/eventTypes.js';
import type { SideBarEventTypes } from 'core/serviceCreators/sideBarManagerServiceCreator/constants/eventTypes.js';
import type { StatisticsEventTypes } from 'core/serviceCreators/statisticsServiceCreator/constants/eventTypes.js';
import type { PlatformOutEventTypes } from 'binary/helper/platformMiddleware/OutType.js';*/

// bus types
export type BusAvailableEventsType = {};

export type BusEventType<PayloadType> = {
  type: BusAvailableEventsType,
  payload: PayloadType,
};

/*
// common event names constants
export { ASSISTANT_EVENT_TYPES } from 'widgets/assistant/constants/eventTypes.js';
export { SIDE_BAR_EVENT_TYPES } from 'core/serviceCreators/sideBarManagerServiceCreator/constants/eventTypes.js';
export { STATISTICS_EVENT_TYPES } from 'core/serviceCreators/statisticsServiceCreator/constants/eventTypes.js';
export { PAIR_EVENT_NAMES, RATE_EVENT_NAMES } from 'binary/helper/platformMiddleware/OutType.js';

// export types
export type { CurrentPairPayloadType } from 'binary/helper/platformMiddleware/OutType.js';
export type { CurrentRatePayloadType } from 'binary/helper/platformMiddleware/OutType.js';
*/
