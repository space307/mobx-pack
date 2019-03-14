import { createService } from '../serviceUtils.js';


describe('serviceUtils test', () => {

  it('createService', () => {
    class Test {
      constructor(a, b) {
        this.a = a;
        this.b = b;
      }
    }
    const service = createService(Test, [1, 2]);
    expect(service.a).toBe(1);
    expect(service.b).toBe(2);
  });


});
