


export default function serviceConnector(service, {bindAs, context, services}){

  console.log(['serviceConnector', context.binder]);


  service.start = function(){

    context.binder.bind(service, {bindAs, services})

  }


}
