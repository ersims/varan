import babelPreset from 'babel-preset-varan';
import rawBuild from '../../src/lib/build';
import rawWatch from '../../src/lib/watch';
import rawCreateCommonConfig from '../../src/webpack/createCommonConfig';
import rawCreateClientConfig from '../../src/webpack/createClientConfig';
import rawCreateServerConfig from '../../src/webpack/createServerConfig';
import { build, watch, createClientConfig, createServerConfig, createCommonConfig } from '../../src/index';

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
it('should re-export createCommonConfig', () => {
  expect(createCommonConfig).toBe(rawCreateCommonConfig);
});
it('should re-export createClientConfig', () => {
  expect(createClientConfig).toBe(rawCreateClientConfig);
});
it('should re-export createServerConfig', () => {
  expect(createServerConfig).toBe(rawCreateServerConfig);
});
