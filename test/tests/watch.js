// Dependencies
const path = require('path');
const MockProject = require('../fixtures/MockProject');
const watch = require('../../src/watch');

// Init
const slowTimeout = 20000;

// Tests
describe('watch', () => {
  it('should work with default values', async (done) => {
    jest.setTimeout(slowTimeout);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const mockProject = new MockProject('watch-default', 'basic');
    const [client, server] = await watch({ cwd: mockProject.targetDir });

    /**
     * Assertions
     */
    // Client
    expect(mockProject.hasFile( 'dist/client/asset-manifest.json')).toBe(true);

    // CSS
    expect(mockProject.getMatch('dist/client/static/css/*.css').code).toBe(2);
    expect(mockProject.getMatch('dist/client/static/css/*.css.map').code).toBe(2);

    // JS
    expect(mockProject.getMatch('dist/client/index.js').code).toBe(0);
    expect(mockProject.getMatch('dist/client/index.js.map').code).toBe(0);
    expect(mockProject.getMatch('dist/client/static/js/*.js').code).toBe(2);
    expect(mockProject.getMatch('dist/client/static/js/*.js.map').code).toBe(2);

    // Server
    expect(mockProject.hasFile( 'dist/server/bin/app.js')).toBe(true);
    expect(mockProject.hasFile( 'dist/server/bin/app.js.map')).toBe(true);
    expect(mockProject.hasFile( 'dist/server/asset-manifest.json')).toBe(true);

    // Templates
    expect(mockProject.hasFile( 'dist/templates/index.hbs')).toBe(true);

    // Done
    client.close();
    server.close();
    done();
  });
  it('should support user specified client webpack config without devserver', async (done) => {
    jest.setTimeout(slowTimeout);
    const mockProject = new MockProject('watch-user-client', 'basic');
    const [, server] = await watch({
      cwd: mockProject.targetDir,
      clientConfigFile: path.resolve(__dirname, '../fixtures/webpack/customClientFn.js'),
    });

    /**
     * Assertions
     */
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
    expect(mockProject.hasFile( 'dist/server/bin/app.js')).toBe(true);
    expect(mockProject.hasFile( 'dist/server/bin/app.js.map')).toBe(true);
    expect(mockProject.hasFile( 'dist/server/asset-manifest.json')).toBe(true);

    // Templates
    expect(mockProject.hasFile( 'dist/templates/index.hbs')).toBe(true);

    // Done
    server.close();
    done();
  });
  it('should give meaningful error message if no config files were provided', () => {
    return expect(watch({ clientConfigFile: null, serverConfigFile: null })).rejects.toThrow('Must specify at least one config file to watch');
  });
});
