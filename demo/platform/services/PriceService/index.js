import { BaseStore } from 'index.js';
import { observable, action, reaction } from 'mobx';
import { PRICE_SERVICE, ASSET_SERVICE } from 'demo/platform/constants/moduleNames.js';
import context from 'demo/platform/helper/context.js';
import serviceConnector from 'demo/platform/helper/serviceConnector.js';

function randNumber(min, max) {
  return Math.floor(Math.random() * (max - (min + 1))) + min;
}

export class PriceService {

  @observable bidPrice = null;
  @observable askPrice = null;
  asset = null;


  onBind(assetService){

    this.assetService = assetService;

       reaction(
         () => (this.assetService.selectedAssetData),
         () => {
           this.asset = this.assetService.selectedAssetData.id;
           this.generatePrice();
         }, true,
       );

       setInterval(() => {
         this.generatePrice();
       }, 1000);


  }


  @action generatePrice() {
    if (this.assetService.selectedAssetData) {
      const { minPrice, spread } = this.assetService.selectedAssetData;
      this.bidPrice = randNumber(minPrice - 10, minPrice + 10);
      this.askPrice = randNumber(minPrice + spread + 10, minPrice + (spread - 10));
      //console.log([this.bidPrice, this.askPrice]);
    }
  }
}


const priceService = new PriceService();

export default serviceConnector(new PriceService(),
  {
    context,
    config:{
      bindAs:PRICE_SERVICE,
      onBind:[
        [ASSET_SERVICE, priceService.onBind]
      ]
    }

  }
  );
