// Dependencies
const path = require('path');
const MockProject = require('../../fixtures/MockProject');
const { build, watch } = require('../../../index');

// Init
const slowTimeout = 20000;

// Tests
describe('examples', () => {
  describe('basic', () => {
    describe('build', () => {
      it('should work with default values', async (done) => {
        jest.setTimeout(slowTimeout);
        const mockProject = new MockProject('examples-build-default', 'basic', path.resolve(__dirname, '../../../examples'));
        await expect(build({ cwd: mockProject.targetDir })).resolves.toEqual(expect.arrayContaining([]));

        /**
         * Assertions
         */
        // Client
        expect(mockProject.hasFile('dist/client/asset-manifest.json')).toBe(true);

        // CSS
        const css = mockProject.getFile('dist/client/static/css/*.css');
        expect(css.length).toBe(1);
        expect(css[0].size).toBeGreaterThan(0);
        expect(css[0].size).toBeLessThan(2 * 1024);
        expect(mockProject.getMatch('dist/client/static/css/*.css.map').code).toBe(2);

        // JS
        const js = mockProject.getFile('dist/client/static/js/*.js');
        expect(js.length).toBe(2);
        expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.js/);
        expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.chunk\.js/);
        expect(js[0].size).toBeGreaterThan(0);
        expect(js[0].size).toBeLessThan(10 * 1024);
        expect(js[1].size).toBeGreaterThan(0);
        expect(js[1].size).toBeLessThan(110 * 1024);
        expect(mockProject.getMatch('dist/client/static/js/*.map').code).toBe(2);

        // Server
        expect(mockProject.hasFile('dist/server/app.js')).toBe(true);
        expect(mockProject.hasFile('dist/server/app.js.map')).toBe(true);
        expect(mockProject.hasFile('dist/server/asset-manifest.json')).toBe(true);

        // Templates
        expect(mockProject.hasFile('dist/templates/index.hbs')).toBe(true);

        // Done
        done();
      });
      it('should support user specified webpack config', async (done) => {
        jest.setTimeout(slowTimeout);
        const mockProject = new MockProject('examples-build-user', 'basic', path.resolve(__dirname, '../../../examples'));

        // Add current working directory as env variable
        process.env.TEST_USER_CWD = mockProject.targetDir;

        await expect(build({
          cwd: mockProject.targetDir,
          configs: [
            '../../fixtures/webpack/customClient.js'
          ].map(p => path.resolve(__dirname, p)),
        })).resolves.toEqual(expect.arrayContaining([]));


        /**
         * Assertions
         */
        // Client
        expect(mockProject.hasFile('dist/client/asset-manifest.json')).toBe(true);

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
        expect(mockProject.hasFile('dist/templates/index.hbs')).toBe(true);

        // Done
        done();
      });
    });
    describe('watch', () => {
      it('should work with default values', async (done) => {
        jest.setTimeout(slowTimeout);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const mockProject = new MockProject('examples-watch-default', 'basic', path.resolve(__dirname, '../../../examples'));
        const [client, server] = await watch({ cwd: mockProject.targetDir });

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
        expect(mockProject.hasFile( 'dist/server/app.js')).toBe(true);
        expect(mockProject.hasFile( 'dist/server/app.js.map')).toBe(true);
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
        const mockProject = new MockProject('examples-watch-user', 'basic', path.resolve(__dirname, '../../../examples'));
        const [, server] = await watch({
          cwd: mockProject.targetDir,
          clientConfigFile: path.resolve(__dirname, '../../fixtures/webpack/customClientFn.js'),
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
        expect(mockProject.hasFile( 'dist/server/app.js')).toBe(true);
        expect(mockProject.hasFile( 'dist/server/app.js.map')).toBe(true);
        expect(mockProject.hasFile( 'dist/server/asset-manifest.json')).toBe(true);

        // Templates
        expect(mockProject.hasFile( 'dist/templates/index.hbs')).toBe(true);

        // Done
        server.close();
        done();
      });
    });
  });
});
