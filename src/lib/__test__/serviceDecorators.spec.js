/* eslint-disable no-unused-vars */
import { onStop, onStart, onUnbind, onBind, bindAs } from '../serviceDecorators.js';


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

  it('wrong onBind param', () => {
    expect(() => {
      @bindAs('test')
      class Service {
        @onBind
        onBind() {}
      }
    }).toThrow();

    expect(() => {
      @bindAs('test')
      class Service {
        @onBind()
        onBind() {}
      }
    }).toThrow();
    expect(() => {
      @bindAs('test')
      class Service {
        @onBind('test1', 1)
        onBind() {}
      }
    }).toThrow();
  });

  it('wrong onStart param', () => {
    expect(() => {
      @bindAs('test')
      class Service {
        @onStart
        onStart() {}
      }
    }).toThrow();

    expect(() => {
      @bindAs('test')
      class Service {
        @onStart()
        onStart() {}
      }
    }).toThrow();
    expect(() => {
      @bindAs('test')
      class Service {
        @onStart('test1', 1)
        onStart() {}
      }
    }).toThrow();
  });


  it('serviceDecorators config', () => {
    @bindAs('test')
    class Service {
      @onStart('init')
      onStart() {}

      @onBind('test1', 'test2')
      onBind() {}

      @onBind('test1', 'test2')
      onBindOnlyGarageService() {}

      @onUnbind('test1', 'test2')
      onUnbind() {}

      @onStop
      onStop() {}
    }


    expect(Service.binderConfig).toMatchSnapshot();
  });
});
