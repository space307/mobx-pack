/* eslint-disable no-unused-vars */
import { onStop, onStart, unbindServices, bindServices, bindAs } from '../serviceDecorators.js';


describe('serviceDecorators test', () => {
  it('wrong bindAs param', () => {
    expect(() => {
      @bindAs
      class Service {
      }
    }).toThrow();

    expect(() => {
      @bindAs()
      class Service {
      }
    }).toThrow();

    expect(() => {
      @bindAs(1)
      class Service {
      }
    }).toThrow();
  });

  it('wrong bindServices param', () => {
    expect(() => {
      @bindAs('test')
      class Service {
        @bindServices
        onBind() {}
      }
    }).toThrow();

    expect(() => {
      @bindAs('test')
      class Service {
        @bindServices()
        onBind() {}
      }
    }).toThrow();
    expect(() => {
      @bindAs('test')
      class Service {
        @bindServices('test1', 1)
        onBind() {}
      }
    }).toThrow();
  });


  it('serviceDecorators config', () => {
    @bindAs('test')
    class Service {
      @onStart
      onStart() {}

      @bindServices('test1', 'test2')
      onBind() {}

      @bindServices('test1', 'test2')
      onBindOnlyGarageStore() {}

      @unbindServices('test1', 'test2')
      onUnbind() {}

      @onStop
      onStop() {}
    }


    expect(Service.binderConfig).toMatchSnapshot();
  });
});
