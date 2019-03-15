import { onStop, onStart, unbindServices, bindServices, bindAs } from '../serviceDecorators.js';





describe('serviceUtils test', () => {
  it('createService', () => {

    @bindAs()
    class Service {
      @onStart
      onStart() {}
    }


    //expect(service.b).toBe(2);
  });
});
