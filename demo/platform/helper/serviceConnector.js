function startOk(service, options){

  options.context.binder.bind(service, options.config);
  service.__serviceOptions.started = true;
}

function stopOk(service, options){

  options.context.binder.unbind(options.config.bindAs);
  service.__serviceOptions.started = false;

}


export default function serviceConnector(service, options){

  if(!service.__serviceOptions){
    service.__serviceOptions = {
      started: false,
    }
  }

  if(typeof service.start !== 'function' && !service.__serviceOptions.started){
    service.start = function(){

      return new Promise((resolve, reject)=>{

        const onStart = options.onStart || service.onStart;

        if(typeof onStart === 'function'){

          let onStartResult = onStart.call(service);

          if (onStartResult instanceof Promise) {
            onStartResult.then(()=>{
              startOk(service, options);
              resolve();
            }).catch((err)=>{
              reject(err);
            });
          } else if(onStartResult !== false){
            startOk(service, options);
            resolve();
          } else {
            reject(`Service ${options.config.bindAs} onStart return "false"`);
          }

        } else {
          startOk(service, options);
          resolve();
        }
      });
    };

    service.stop = function(){
      const onStop = options.onStop || service.onStop;

      if(typeof onStop === 'function'){
        onStop.call(service);
        stopOk(service, options);
      }

    }

  }

  return service;

}
