// @flow

import Api from '../api/api.js';
import bus from '../../bus/bus.js';
import {
  PAIR_EVENT_NAMES,
  RATE_EVENT_NAMES,
  type CurrentPairPayloadType,
  type CurrentRatePayloadType,
  type BusEventType,
} from '../../bus/busTypes.js';

export default function(): void {
  bus.select(PAIR_EVENT_NAMES.CURRENT_PAIR).subscribe(
    ({ payload: pair }: { payload: CurrentPairPayloadType }): void => {
      Api.setPair(pair);
    },
  );

  bus.select(RATE_EVENT_NAMES.CURRENT_RATE).subscribe(
    ({ payload: rate }: BusEventType<CurrentRatePayloadType>): void => {
      Api.setRate(rate);
    },
  );
}
