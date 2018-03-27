const MockProject = require('../fixtures/MockProject');

// Tests
describe('varan build', () => {
  it('should work with default values', () => {
    const mockProject = new MockProject('build-default', 'basic');
    mockProject.shell.exec('node ../../../cli.js build');

    /**
     * Assertions
     */
    // Client
    expect(mockProject.shell.test('-f', 'dist/client/asset-manifest.json')).toBe(true);

    // CSS
    const css = mockProject.shell.ls('-l', 'dist/client/static/css/*.css');
    expect(css.length).toBe(1);
    expect(css[0].size).toBeGreaterThan(0);
    expect(css[0].size).toBeLessThan(2 * 1024);
    expect(mockProject.shell.ls('dist/client/static/css/*.css.map').code).toBe(2);

    // JS
    const js = mockProject.shell.ls('-l', 'dist/client/static/js/*.js');
    expect(js.length).toBe(2);
    expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.js/);
    expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.chunk\.js/);
    expect(js[0].size).toBeGreaterThan(0);
    expect(js[0].size).toBeLessThan(10 * 1024);
    expect(js[1].size).toBeGreaterThan(0);
    expect(js[1].size).toBeLessThan(100 * 1024);
    expect(mockProject.shell.ls('dist/client/static/js/*.map').code).toBe(2);

    // Server
    expect(mockProject.shell.test('-f', 'dist/server/bin/app.js')).toBe(true);
    expect(mockProject.shell.test('-f', 'dist/server/bin/app.js.map')).toBe(true);
    expect(mockProject.shell.test('-f', 'dist/server/bin/asset-manifest.json')).toBe(true);

    // Templates
    expect(mockProject.shell.test('-f', 'dist/templates/index.hbs')).toBe(true);
  });

  it('should support user specified webpack config', () => {
    const mockProject = new MockProject('build-user', 'basic');
    mockProject.shell.exec('node ../../../cli.js build ../../../test/fixtures/webpack/customClient.js');

    /**
     * Assertions
     */
    // Client
    expect(mockProject.shell.test('-f', 'dist/client/asset-manifest.json')).toBe(true);

    // CSS
    expect(mockProject.shell.ls('dist/client/static/css/*.css').length).toBe(1);
    expect(mockProject.shell.ls('dist/client/static/css/*.css.map').code).toBe(0);

    // JS
    expect(mockProject.shell.ls('dist/client/static/js/*.js').code).toBe(2);
    expect(mockProject.shell.ls('dist/client/static/js/*.js.map').code).toBe(2);
    expect(mockProject.shell.ls('dist/client/customFileName.js').code).toBe(0);
    expect(mockProject.shell.ls('dist/client/customFileName.js.map').code).toBe(0);
    expect(mockProject.shell.ls('dist/client/customFileName.vendor.*.chunk.js').code).toBe(0);
    expect(mockProject.shell.ls('dist/client/customFileName.vendor.*.chunk.js.map').code).toBe(0);

    // Server
    expect(mockProject.shell.test('-d', 'dist/server')).toBe(false);

    // Templates
    expect(mockProject.shell.test('-f', 'dist/templates/index.hbs')).toBe(true);
  });
});
