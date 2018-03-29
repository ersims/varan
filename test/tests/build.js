// Dependencies
const path = require('path');
const MockProject = require('../fixtures/MockProject');
const { build } = require('../../index');

// Init
const slowTimeout = 20000;

// Tests
describe('build', () => {
  it('should work with default values', async (done) => {
    jest.setTimeout(slowTimeout);
    const mockProject = new MockProject('build-default', 'basic');
    await expect(build({ cwd: mockProject.targetDir })).resolves.toEqual(expect.arrayContaining([]));

    /**
     * Assertions
     */
    // Client
    expect(mockProject.hasFile('dist/client/asset-manifest.json')).toBe(true);

    // CSS
    const css = mockProject.getFile( 'dist/client/static/css/*.css');
    expect(css.length).toBe(1);
    expect(css[0].size).toBeGreaterThan(0);
    expect(css[0].size).toBeLessThan(2 * 1024);
    expect(mockProject.getMatch('dist/client/static/css/*.css.map').code).toBe(2);

    // JS
    const js = mockProject.getFile( 'dist/client/static/js/*.js');
    expect(js.length).toBe(2);
    expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.js/);
    expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.chunk\.js/);
    expect(js[0].size).toBeGreaterThan(0);
    expect(js[0].size).toBeLessThan(10 * 1024);
    expect(js[1].size).toBeGreaterThan(0);
    expect(js[1].size).toBeLessThan(100 * 1024);
    expect(mockProject.getMatch('dist/client/static/js/*.map').code).toBe(2);

    // Server
    expect(mockProject.hasFile( 'dist/server/app.js')).toBe(true);
    expect(mockProject.hasFile( 'dist/server/app.js.map')).toBe(true);
    expect(mockProject.hasFile( 'dist/server/asset-manifest.json')).toBe(true);

    // Templates
    expect(mockProject.hasFile( 'dist/templates/index.hbs')).toBe(true);

    // Done
    done();
  });
  it('should support user specified webpack config', async (done) => {
    jest.setTimeout(slowTimeout);
    const mockProject = new MockProject('build-user', 'basic');

    // Mock logger
    console.log = jest.fn();

    // Add current working directory as env variable
    process.env.TEST_USER_CWD = mockProject.targetDir;

    await expect(build({
      cwd: mockProject.targetDir,
      configFiles: [
        '../fixtures/webpack/customClient.js'
      ].map(p => path.resolve(__dirname, p)),
      silent: true,
    })).resolves.toEqual(expect.arrayContaining([]));


    /**
     * Assertions
     */
    // Check logging
    expect(console.log).toHaveBeenCalledTimes(0);

    // Client
    expect(mockProject.hasFile( 'dist/client/asset-manifest.json')).toBe(true);

    // CSS
    expect(mockProject.getMatch('dist/client/static/css/*.css').length).toBe(1);
    expect(mockProject.getMatch('dist/client/static/css/*.css.map').code).toBe(0);

    // JS
    expect(mockProject.getMatch('dist/client/static/js/*.js').code).toBe(2);
    expect(mockProject.getMatch('dist/client/static/js/*.js.map').code).toBe(2);
    expect(mockProject.getMatch('dist/client/customFileName.js').code).toBe(0);
    expect(mockProject.getMatch('dist/client/customFileName.js.map').code).toBe(0);
    expect(mockProject.getMatch('dist/client/customFileName.vendor.*.chunk.js').code).toBe(0);
    expect(mockProject.getMatch('dist/client/customFileName.vendor.*.chunk.js.map').code).toBe(0);

    // Server
    expect(mockProject.shell.test('-d', 'dist/server')).toBe(false);

    // Templates
    expect(mockProject.hasFile( 'dist/templates/index.hbs')).toBe(true);

    // Done
    done();
  });
  it('should give meaningful error message if no config files were provided', () => {
    return expect(build({ configFiles: [] })).rejects.toThrow('Must specify at least one config file to build');
  });
  it('should reject a broken build and give give meaningful error message', async (done) => {
    jest.setTimeout(slowTimeout);
    const mockProject = new MockProject('build-fail', 'project-with-error', path.resolve(__dirname, '../fixtures'));

    // Mock logger
    console.error = jest.fn();

    /**
     * Assertions
     */
    await expect(build({
      cwd: mockProject.targetDir,
      configFiles: [
        '../fixtures/webpack/customClientExtends.js'
      ].map(p => path.resolve(__dirname, p)),
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
    const mockProject = new MockProject('build-fail', 'project-with-warning', path.resolve(__dirname, '../fixtures'));

    // Mock logger
    console.warn = jest.fn();

    /**
     * Assertions
     */
    await build({
      cwd: mockProject.targetDir,
      configFiles: [
        '../fixtures/webpack/customClientExtends.js'
      ].map(p => path.resolve(__dirname, p)),
      warnBundleSize: 1,
    });

    // Check logging
    const output = console.warn.mock.calls[0][0][0];
    expect(console.warn).toHaveBeenCalled();
    expect(output).toEqual(expect.stringContaining('(index.js) ./src/client/index.js'));
    expect(output).toEqual(expect.stringContaining('Critical dependency: the request of a dependency is an expression'));

    // Done
    done();
  });
});
