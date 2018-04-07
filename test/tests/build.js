// Dependencies
const path = require('path');
const MemoryFileSystem = require('memory-fs');
const { build } = require('../../index');
const { hasFile, getFiles, resolver } = require('../fixtures/utils');

// Init
const slowTimeout = 20000;

// Tests
describe('build', () => {
  it('should reject a broken build and give meaningful error message', async (done) => {
    jest.setTimeout(slowTimeout);
    const mfs = new MemoryFileSystem();
    const resolve = resolver(__dirname, '../fixtures/projects/with-error');

    // Mock logger
    console.error = jest.fn();

    /**
     * Assertions
     */
    await expect(build({
      cwd: resolve(),
      configs: [
        '../fixtures/webpack/customClientExtends.js'
      ].map(p => path.resolve(__dirname, p)),
      outputFileSystem: mfs,
      silent: true,
    })).rejects.toThrow('Build failed');

    // Check logging
    expect(console.error).toHaveBeenCalled();
    expect(console.error.mock.calls[0][0][0]).toEqual(
      expect.arrayContaining([
        expect.stringContaining('(index.js) ./src/client/index.js'),
        expect.stringContaining('Module build failed: SyntaxError'),
      ])
    );

    // Done
    done();
  });
  it('should display webpack warnings', async (done) => {
    jest.setTimeout(slowTimeout);
    const mfs = new MemoryFileSystem();
    const resolve = resolver(__dirname, '../fixtures/projects/with-warning');

    // Mock logger
    console.warn = jest.fn();

    /**
     * Assertions
     */
    await build({
      cwd: resolve(),
      configs: [
        '../fixtures/webpack/customClientExtends.js'
      ].map(p => path.resolve(__dirname, p)),
      outputFileSystem: mfs,
      warnBundleSize: 1,
      silent: true,
    });

    // Check logging
    const output = console.warn.mock.calls[0][0][0];
    expect(console.warn).toHaveBeenCalled();
    expect(output).toEqual(expect.stringContaining('(index.js) ./src/client/index.js'));
    expect(output).toEqual(expect.stringContaining('Critical dependency: the request of a dependency is an expression'));

    // Done
    done();
  });
  it('should work with default values', async (done) => {
    jest.setTimeout(slowTimeout);
    const mfs = new MemoryFileSystem();
    const resolve = resolver(__dirname, '../fixtures/projects/basic');

    /**
     * Assertions
     */
    await expect(build({
      cwd: resolve(),
      outputFileSystem: mfs,
      silent: true,
    })).resolves.toEqual(expect.objectContaining({}));

    // Client
    expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/client/favicon.ico'))).toBe(true);

    // CSS
    const css = getFiles(mfs, resolve('dist/client/static/css'));
    expect(css.length).toBe(1);
    expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.css/);
    expect(css[0].size).toBeGreaterThan(0);
    expect(css[0].size).toBeLessThan(100);

    // JS
    const js = getFiles(mfs, resolve('dist/client/static/js'));
    expect(js.length).toBe(2);
    expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.js/);
    expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.chunk\.js/);
    expect(js[0].size).toBeGreaterThan(0);
    expect(js[0].size).toBeLessThan(2 * 1024);
    expect(js[1].size).toBeGreaterThan(0);
    expect(js[1].size).toBeLessThan(110 * 1024);

    // Templates
    expect(hasFile(mfs, resolve('dist/templates/index.hbs'))).toBe(true);

    // Server
    expect(hasFile(mfs, resolve('dist/server/bin/web.js'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/server/bin/web.js.map'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/server/bin/asset-manifest.json'))).toBe(true);

    // Done
    done();
  });
  it('should support custom webpack config', async (done) => {
    jest.setTimeout(slowTimeout);
    const mfs = new MemoryFileSystem();
    const resolve = resolver(__dirname, '../fixtures/projects/basic');

    // Add current working directory as env variable
    process.env.TEST_USER_CWD = resolve();

    /**
     * Assertions
     */
    await expect(build({
      cwd: resolve(),
      outputFileSystem: mfs,
      silent: true,
      configs: [
        '../fixtures/webpack/customClient.js'
      ].map(p => path.resolve(__dirname, p)),
    })).resolves.toEqual(expect.objectContaining({}));

    // Client
    expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);
    expect(hasFile(mfs, resolve('dist/client/favicon.ico'))).toBe(true);

    // CSS
    const css = getFiles(mfs, resolve('dist/client/static/css'));
    expect(css.length).toBe(2);
    expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.css/);
    expect(css[1].name).toMatch(/main\.([a-z0-9]{8})\.css\.map/);
    expect(css[0].size).toBeGreaterThan(0);
    expect(css[0].size).toBeLessThan(2 * 1024);

    // JS
    expect(hasFile(mfs, resolve('dist/client/static/js'))).toBe(false);
    const js = getFiles(mfs, resolve('dist/client')).filter(f => f.isFile() && (f.name.endsWith('.js') || f.name.endsWith('.js.map')));
    expect(js.length).toBe(4);
    expect(js[0].name).toMatch('customFileName.js');
    expect(js[1].name).toMatch('customFileName.js.map');
    expect(js[2].name).toMatch(/customFileName\.vendor\.([a-z0-9]{8})\.chunk\.js/);
    expect(js[3].name).toMatch(/customFileName\.vendor\.([a-z0-9]{8})\.chunk\.js\.map/);
    expect(js[0].size).toBeGreaterThan(0);
    expect(js[0].size).toBeLessThan(2 * 1024);
    expect(js[2].size).toBeGreaterThan(0);
    expect(js[2].size).toBeLessThan(110 * 1024);

    // Templates
    expect(hasFile(mfs, resolve('dist/templates/index.hbs'))).toBe(true);

    // Server
    expect(hasFile(mfs, resolve('dist/server'))).toBe(false);

    // Done
    done();
  });
});
