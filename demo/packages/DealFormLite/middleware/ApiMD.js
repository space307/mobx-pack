
/*
// Поток данных между пакетами
from package Alpha to Beta
<Comp />(Alpha) -> store(Alpha) -> outApi(Alpha) -> ApiMd(Alpha) -> inApi(Beta) -> store(Beta) -> <Comp />(Beta)
from package Beta to Alpha
<Comp />(Beta) -> store(Beta) -> outApi(Beta) -> ApiMd(Beta) -> inApi(Alpha) -> store(Alpha) -> <Comp />(Alpha)

ApiMd(Alpha) = должен знать inApi(Beta)
ApiMd(Beta) = должен знать inApi(Alpha)

*/


export default class ApiMD {
  platformApi;
  constructor(platformApi) {
    this.platformApi = platformApi;
  }

  getBalance(cb, type) {
    this.platformApi.getBalance(cb, type);
  }

  selectAsset(asset) {
    this.platformApi.selectAsset(asset);
  }

  subsBidPrice(cb) {
    this.platformApi.subsBidPrice(cb);
  }

  subsSelectedAsset(cb) {
    this.platformApi.subsSelectedAsset(cb);
  }
}

