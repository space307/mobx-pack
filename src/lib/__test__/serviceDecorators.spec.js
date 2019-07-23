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

  describe('extends class with decorators', () => {
    let ParentService;
    let ExtendedService;

    beforeEach(() => {
      @bindAs('ParentService')
      class ParentServiceClass {
        @onStart('onStartParentService')
        onStart() {}

        @onBind('onBindParentService1', 'onBindParentService2')
        onBind() {}

        @onBind('onBindParentService3', 'onBindParentService4')
        onBindAdditionServices() {}

        @onUnbind('onUnbindParentService1', 'onUnbindParentService2')
        onUnbind() {}

        @onUnbind('onUnbindParentService3', 'onUnbindParentService4')
        onUnbindAdditionServices() {}

        @onStop
        onStop() {}
      }

      ParentService = ParentServiceClass;
    });

    describe('bindAs', () => {
      beforeEach(() => {
        @bindAs('ExtendedService')
        class ExtendedServiceClass extends ParentService {}

        ExtendedService = ExtendedServiceClass;
      });

      it('should extends new class with other bindAs', () => {
        expect(ExtendedService.binderConfig.bindAs).toEqual('ExtendedService');
      });

      it('should stay ParentService without changes in bindAs after extend', () => {
        expect(ParentService.binderConfig.bindAs).toEqual('ParentService');
      });

      it('should extends new class with parent bindAs if not redefined', () => {
        class ExtendedServiceClass extends ParentService {}

        expect(ExtendedServiceClass.binderConfig.bindAs).toEqual('ParentService');
      });
    });


    describe('onStart', () => {
      beforeEach(() => {
        class ExtendedServiceClass extends ParentService {
          @onStart('onStartExtendedService')
          onStart() {}
        }

        ExtendedService = ExtendedServiceClass;
      });

      it('should extends new class with other onStart', () => {
        expect(ExtendedService.binderConfig.onStart).toEqual([
          'onStartExtendedService',
          'onStart',
        ]);
      });

      it('should stay ParentService without changes in onStart after extend', () => {
        expect(ParentService.binderConfig.onStart).toEqual([
          'onStartParentService',
          'onStart',
        ]);
      });

      it('should extends new class with parent onStart if not redefined', () => {
        class ExtendedServiceClass extends ParentService {}

        expect(ExtendedServiceClass.binderConfig.onStart).toEqual([
          'onStartParentService',
          'onStart',
        ]);
      });
    });

    describe('onBind', () => {
      beforeEach(() => {
        class ExtendedServiceClass extends ParentService {
          @onBind('onBindExtendedService1')
          onBind() {}

          @onBind('onBindExtendedService3')
          onBindAdditionExtendedServices() {}
        }

        ExtendedService = ExtendedServiceClass;
      });

      it('should extends new class with other onBind', () => {
        expect(ExtendedService.binderConfig.onBind).toEqual([
          [
            'onBindExtendedService1',
            'onBind',
          ],
          [
            'onBindParentService3',
            'onBindParentService4',
            'onBindAdditionServices',
          ],
          [
            'onBindExtendedService3',
            'onBindAdditionExtendedServices',
          ],
        ]);
      });


      it('should stay ParentService without changes in onBind after extend', () => {
        expect(ParentService.binderConfig.onBind).toEqual([
          [
            'onBindParentService1',
            'onBindParentService2',
            'onBind',
          ],
          [
            'onBindParentService3',
            'onBindParentService4',
            'onBindAdditionServices',
          ],
        ]);
      });
    });


    describe('onUnbind', () => {
      beforeEach(() => {
        class ExtendedServiceClass extends ParentService {
          @onUnbind('onUnbindExtendedService1')
          onUnbind() {}

          @onUnbind('onUnbindExtendedService3')
          onUnbindAdditionExtendedServices() {}
        }

        ExtendedService = ExtendedServiceClass;
      });

      it('should extends new class with other onUnbind', () => {
        expect(ExtendedService.binderConfig.onUnbind).toEqual([
          [
            'onUnbindExtendedService1',
            'onUnbind',
          ],
          [
            'onUnbindParentService3',
            'onUnbindParentService4',
            'onUnbindAdditionServices',
          ],
          [
            'onUnbindExtendedService3',
            'onUnbindAdditionExtendedServices',
          ],
        ]);
      });


      it('should stay ParentService without changes in onUnbind after extend', () => {
        expect(ParentService.binderConfig.onUnbind).toEqual([
          [
            'onUnbindParentService1',
            'onUnbindParentService2',
            'onUnbind',
          ],
          [
            'onUnbindParentService3',
            'onUnbindParentService4',
            'onUnbindAdditionServices',
          ],
        ]);
      });
    });


    describe('onStop', () => {
      beforeEach(() => {
        class ExtendedServiceClass extends ParentService {
          @onStop
          onStopExtended() {}
        }

        ExtendedService = ExtendedServiceClass;
      });

      it('should extends new class with other onStop', () => {
        expect(ExtendedService.binderConfig.onStop).toEqual('onStopExtended');
      });

      it('should stay ParentService without changes in onStop after extend', () => {
        expect(ParentService.binderConfig.onStop).toEqual('onStop');
      });

      it('should extends new class with parent onStop if not redefined', () => {
        class ExtendedServiceClass extends ParentService {}

        expect(ExtendedServiceClass.binderConfig.onStop).toEqual('onStop');
      });
    });
  });
});
