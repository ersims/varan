import babelPreset from 'babel-preset-varan';
import rawBuild from '../../src/lib/build';
import rawWatch from '../../src/lib/watch';
import { build, watch } from '../../src/index';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const babelExport = require('../../babel');

// Tests
it('should export build', () => {
  expect(build).toBe(rawBuild);
});
it('should export watch', () => {
  expect(watch).toBe(rawWatch);
});
it('should re-export babel-preset-varan', () => {
  expect(babelExport).toBe(babelPreset);
});
