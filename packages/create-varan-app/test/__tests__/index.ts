import * as Exports from '../../src';
import init from '../../src/lib/init';

// Tests
it('should export the init function', () => {
  expect(Exports.init).toBe(init);
});
