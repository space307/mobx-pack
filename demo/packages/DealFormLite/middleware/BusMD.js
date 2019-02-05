


export default class busMD {
  platformApi;
  constructor(bus) {
    this.bus = bus;


    
  }

  getAsset(cb) {
    cb(this.platformApi.getAsset());
  }
}

/*
bus.select(PAIR_EVENT_NAMES.CURRENT_PAIR).subscribe(
  ({ payload: pair }: { payload: CurrentPairPayloadType }): void => {
    Api.setPair(pair);
  },
);*/
