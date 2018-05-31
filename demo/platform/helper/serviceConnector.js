


export default function serviceConnector(service, options){

  console.log(['serviceConnector', context.binder]);


  service.start = function(){

    context.binder.bind(service, options)

  }


}
