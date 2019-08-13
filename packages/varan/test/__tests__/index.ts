// Dependencies
import rawBuild from '../../src/lib/build';
import rawWatch from '../../src/lib/watch';
import { build, watch } from '../../src/index';

// Tests
it('should export build', () => {
  expect(build).toBe(rawBuild);
});
it('should export watch', () => {
  expect(watch).toBe(rawWatch);
});
