// Dependencies
const MemoryFileSystem = require('memory-fs');
const fs = require('fs');
const { build } = require('../../../index');
const { hasFile, getFiles, resolver } = require('../../fixtures/utils');

// Init
const slowTimeout = 40000;
const resolve = resolver(__dirname, '../../../template');

// Tests
describe('template', () => {
  describe('build', () => {
    it('should work with default values', async done => {
      jest.setTimeout(slowTimeout);
      const mfs = new MemoryFileSystem();

      // Mock fs calls to stats-manifest.json as these are used by sw-precache-plugin
      // to generate the service worker and will fail if not mocked
      const orgStatSync = fs.statSync;
      const orgReadFileSync = fs.readFileSync;
      fs.statSync = path => {
        if (/stats-manifest\.json/.test(path)) {
          return {
            ...mfs.statSync(path),
            size: mfs.meta(path).byteLength,
          };
        }
        return orgStatSync(path);
      };
      fs.readFileSync = (path, options) => {
        if (/stats-manifest\.json/.test(path)) return mfs.readFileSync(path, options);
        return orgReadFileSync(path, options);
      };

      /**
       * Assertions
       */
      await expect(
        build({
          cwd: resolve(),
          outputFileSystem: mfs,
          silent: true,
        }),
      ).resolves.toEqual(expect.objectContaining({}));

      // Unmock
      fs.statSync = orgStatSync;
      fs.readFileSync = orgReadFileSync;

      // Client
      expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);
      expect(hasFile(mfs, resolve('dist/client/stats-manifest.json'))).toBe(true);
      expect(hasFile(mfs, resolve('dist/client/service-worker.js'))).toBe(true);

      // CSS
      const css = getFiles(mfs, resolve('dist/client/static/css'));
      expect(css.length).toBe(2);
      expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.css/);
      expect(css[0].size).toBeGreaterThan(0);
      expect(css[0].size).toBeLessThan(64);
      expect(css[1].name).toMatch(/vendor\.([a-z0-9]{8})\.chunk\.css/);
      expect(css[1].size).toBeGreaterThan(0);
      expect(css[1].size).toBeLessThan(2 * 1024);

      // JS
      const js = getFiles(mfs, resolve('dist/client/static/js'));
      expect(js.length).toBe(3);
      expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.js/);
      expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.chunk\.js/);
      expect(js[2].name).toMatch(/vendor\.([a-z0-9]{8})\.chunk\.js\.gz/);
      expect(js[0].size).toBeGreaterThan(0);
      expect(js[0].size).toBeLessThan(10 * 1024);
      expect(js[1].size).toBeGreaterThan(0);
      expect(js[1].size).toBeLessThan(150 * 1024);
      expect(js[2].size).toBeGreaterThan(0);
      expect(js[2].size).toBeLessThan(50 * 1024);

      // Media
      const media = getFiles(mfs, resolve('dist/client/static/media'));
      expect(media.length).toBe(1);
      expect(media[0].name).toMatch(/favicon\.([a-z0-9]{8})\.ico/);

      // Server
      expect(hasFile(mfs, resolve('dist/server/bin/web.js'))).toBe(true);
      expect(hasFile(mfs, resolve('dist/server/bin/web.js.map'))).toBe(true);
      expect(hasFile(mfs, resolve('dist/server/bin/stats-manifest.json'))).toBe(true);

      done();
    });
  });
});
