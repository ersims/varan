// Dependencies
import rawBuild from '../../src/build';
import rawInit from '../../src/init';
import rawWatch from '../../src/watch';
import { build, init, watch } from '../../src/index';

// Tests
it('should export build', () => {
  expect(build).toBe(rawBuild);
});
it('should export init', () => {
  expect(init).toBe(rawInit);
});
it('should export watch', () => {
  expect(watch).toBe(rawWatch);
});
