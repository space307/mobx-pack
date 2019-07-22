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
    describe('bindAs', () => {
      @bindAs('ParentService')
      class ParentService {}

      it('should extends new class with other bindAs', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {}

        expect(ExtendedService.binderConfig.bindAs).toEqual('ExtendedService');
      });

      it('should stay ParentService without changes in bindAs after extend', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {}

        expect(ParentService.binderConfig.bindAs).toEqual('ParentService');
      });
    });


    describe('onStart', () => {
      @bindAs('ParentService')
      class ParentService {
        @onStart('onStartParentService')
        onStart() {}
      }

      it('should extends new class with other onStart', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onStart('onStartExtendedService')
          onStart() {}
        }

        expect(ExtendedService.binderConfig.onStart).toEqual([
          'onStartExtendedService',
          'onStart',
        ]);
      });

      it('should stay ParentService without changes in onStart after extend', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onStart('onStartExtendedService')
          onStart() {}
        }

        expect(ParentService.binderConfig.onStart).toEqual([
          'onStartParentService',
          'onStart',
        ]);
      });
    });

    describe('onBind', () => {
      @bindAs('ParentService')
      class ParentService {
        @onBind('onBindParentService1', 'onBindParentService2')
        onBind() {}

        @onBind('onBindParentService3', 'onBindParentService4')
        onBindAdditionServices() {}
      }

      it('should extends new class with other onBind', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onBind('onBindExtendedService1')
          onBind() {}

          @onBind('onBindExtendedService3')
          onBindAdditionExtendedServices() {}
        }

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
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onBind('onBindExtendedService1')
          onBind() {}

          @onBind('onBindExtendedService3')
          onBindAdditionExtendedServices() {}
        }

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
      @bindAs('ParentService')
      class ParentService {
        @onUnbind('onUnbindParentService1', 'onUnbindParentService2')
        onUnbind() {}

        @onUnbind('onUnbindParentService3', 'onUnbindParentService4')
        onUnbindAdditionServices() {}
      }

      it('should extends new class with other onUnbind', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onUnbind('onUnbindExtendedService1')
          onUnbind() {}

          @onUnbind('onUnbindExtendedService3')
          onUnbindAdditionExtendedServices() {}
        }

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
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onUnbind('onUnbindExtendedService1')
          onUnbind() {}

          @onUnbind('onUnbindExtendedService3')
          onUnbindAdditionExtendedServices() {}
        }

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
      @bindAs('ParentService')
      class ParentService {
        @onStop
        onStop() {}
      }

      it('should extends new class with other onStop', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onStop
          onStopExtended() {}
        }

        expect(ExtendedService.binderConfig.onStop).toEqual('onStopExtended');
      });

      it('should stay ParentService without changes in onStop after extend', () => {
        @bindAs('ExtendedService')
        class ExtendedService extends ParentService {
          @onStop
          onStopExtended() {}
        }

        expect(ParentService.binderConfig.onStop).toEqual('onStop');
      });
    });
  });
});
