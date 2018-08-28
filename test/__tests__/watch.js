// Dependencies
const path = require('path');
const MemoryFileSystem = require('memory-fs');
const { watch } = require('../../index');
const { hasFile, resolver } = require('../fixtures/utils');

// Init
const slowTimeout = 40000;

// Tests
describe('watch', () => {
  it('should give meaningful error message if no config files are provided', () => {
    return expect(watch({ configs: [] })).rejects.toThrow('Must specify at least one config');
  });
  it('should give meaningful error message if too many config files are provided', () => {
    return expect(watch({ configs: ['dummy', 'another dummy', 'another dummy again'] })).rejects.toThrow(
      'Too many config files provided. Maximum two config files are supported in `watch` mode.',
    );
  });
  it('should give meaningful error message if invalid config files are provided', async done => {
    expect.assertions(2);
    await expect(watch({ configs: [{ target: 'node' }, { target: 'node' }] })).rejects.toThrow(
      'One or more invalid config files provided. Maximum of one config file per target is supported.',
    );
    await expect(watch({ configs: [{ target: 'web' }, { target: 'web' }] })).rejects.toThrow(
      'One or more invalid config files provided. Maximum of one config file per target is supported.',
    );
    done();
  });
  it('should work with default values', async done => {
    jest.setTimeout(slowTimeout);
    const mfs = new MemoryFileSystem();
    const resolve = resolver(__dirname, '../fixtures/projects/basic');

    /**
     * Assertions
     */
    const servers = await watch({
      cwd: resolve(),
      outputFileSystem: mfs,
      silent: true,
      waitForServer: false,
    });

    // Client
    expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/client/stats-manifest.json'))).toBe(true);

    // Static files
    expect(hasFile(mfs, resolve('dist/client/static'))).toBe(false);

    // JS
    expect(hasFile(mfs, resolve('dist/client/dev-bundle.js'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/client/dev-bundle.js.map'))).toBe(true);

    // Server
    expect(hasFile(mfs, resolve('dist/server/bin/web.js'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/server/bin/web.js.map'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/server/bin/stats-manifest.json'))).toBe(true);

    // Done
    servers.forEach(s => s && s.stop());
    done();
  });
  it('should support custom webpack config', async done => {
    jest.setTimeout(slowTimeout);
    const mfs = new MemoryFileSystem();
    const resolve = resolver(__dirname, '../fixtures/projects/basic');

    // Add current working directory as env variable
    process.env.TEST_USER_CWD = resolve();

    /**
     * Assertions
     */
    const servers = await watch({
      cwd: resolve(),
      outputFileSystem: mfs,
      silent: true,
      configs: [path.resolve(__dirname, '../fixtures/webpack/customClient.js')],
    });

    // Client
    expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);

    // CSS
    expect(hasFile(mfs, resolve('dist/client/static/css/'))).toBe(true);

    // JS
    expect(hasFile(mfs, resolve('dist/client/customFileName.js'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/client/customFileName.js.map'))).toBe(true);

    // Server
    expect(hasFile(mfs, resolve('dist/server'))).toBe(false);

    // Done
    servers.forEach(s => s && s.close());
    done();
  });
});
