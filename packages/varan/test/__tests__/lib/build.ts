import path from 'path';
import MemoryFileSystem from 'memory-fs';
import fs from 'fs';
import zlib from 'zlib';
import build from '../../../src/lib/build';
import { getFiles, hasFile, resolver } from '../../fixtures/utils';
import BuildError from '../../../src/lib/BuildError';

// Init
const slowTimeout = 40000;

// Tests
it('should reject a broken build and give meaningful error message', async done => {
  jest.setTimeout(slowTimeout);
  expect.assertions(3);
  const mfs = new MemoryFileSystem();
  const resolve = resolver(__dirname, '../../fixtures/projects/with-error');

  /**
   * Assertions
   */
  await expect(
    build({
      appDir: resolve(),
      configs: ['../../fixtures/webpack/customClientExtends.js'].map(p => path.resolve(__dirname, p)),
      outputFileSystem: mfs as any,
    }).catch(err => {
      expect(err instanceof BuildError).toBe(true);
      expect(err.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('./src/client/index.jsx'),
          expect.stringMatching(/Module build failed/),
          expect.stringMatching(/SyntaxError(.+)index.jsx: Unexpected token \(7:26\)/),
        ]),
      );
      throw err;
    }),
  ).rejects.toThrow('Build failed with errors');

  // Done
  done();
});
it('should keep webpack warnings', async done => {
  jest.setTimeout(slowTimeout);
  expect.assertions(1);
  const mfs = new MemoryFileSystem();
  const resolve = resolver(__dirname, '../../fixtures/projects/with-warning');

  /**
   * Assertions
   */
  const result = await build({
    appDir: resolve(),
    configs: ['../../fixtures/webpack/customClientExtends.js'].map(p => path.resolve(__dirname, p)),
    outputFileSystem: mfs as any,
    warnBundleSize: 1,
  });

  // Check logging
  expect(result.stats).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        warnings: expect.arrayContaining([
          expect.stringMatching(/Critical dependency: the request of a dependency is an expression/),
        ]),
      }),
    ]),
  );

  // Done
  done();
});
it('should work with default values', async done => {
  jest.setTimeout(slowTimeout);
  expect.assertions(15);

  // TODO: Remove when support for node v8 is dropped on 31.12.2019
  const isBrotliSupported = !!zlib.brotliCompress;
  if (isBrotliSupported) expect.assertions(16);

  const mfs = new MemoryFileSystem();
  const resolve = resolver(__dirname, '../../fixtures/projects/basic');

  // Mock fs calls to stats-manifest.json as these are used by sw-precache-plugin
  // to generate the service worker and will fail if not mocked
  const orgStatSync = fs.statSync;
  const orgReadFileSync = fs.readFileSync;
  fs.statSync = (p: any) => {
    if (/stats-manifest\.json/.test(p)) {
      return {
        ...mfs.statSync(p),
        size: mfs.meta(p).byteLength,
      };
    }
    return orgStatSync(p) as any;
  };
  fs.readFileSync = (p: any, options: any) => {
    if (/stats-manifest\.json/.test(p)) return mfs.readFileSync(p, options);
    return orgReadFileSync(p, options);
  };

  /**
   * Assertions
   */
  await expect(
    build({
      appDir: resolve(),
      outputFileSystem: mfs as any,
    }),
  ).resolves.toEqual(expect.objectContaining({}));

  // Unmock
  fs.statSync = orgStatSync;
  fs.readFileSync = orgReadFileSync;

  // Client
  expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/client/stats-manifest.json'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/client/service-worker.js'))).toBe(true);

  // Asset Manifest
  const assetManifest = JSON.parse(mfs.readFileSync(resolve('dist/client/asset-manifest.json')));
  expect(Object.keys(assetManifest)).toHaveLength(4);

  // CSS
  const css = getFiles(mfs, resolve('dist/client/static/css'));
  expect(css).toHaveLength(1);
  expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.css/);

  // JS
  const js = getFiles(mfs, resolve('dist/client/static/js'));
  expect(js).toHaveLength(isBrotliSupported ? 5 : 4);
  expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.js/);
  expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js/);

  if (isBrotliSupported) {
    expect(js[2].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.br/);
    expect(js[3].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.gz/);
    expect(js[4].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.LICENSE/);
  } else {
    expect(js[2].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.gz/);
    expect(js[3].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.LICENSE/);
  }

  // Server
  expect(hasFile(mfs, resolve('dist/server/bin/web.js'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/server/bin/web.js.map'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/server/bin/stats-manifest.json'))).toBe(true);

  // Done
  done();
});
it('should work with typescript', async done => {
  jest.setTimeout(slowTimeout);
  expect.assertions(15);

  // TODO: Remove when support for node v8 is dropped on 31.12.2019
  const isBrotliSupported = !!zlib.brotliCompress;
  if (isBrotliSupported) expect.assertions(16);

  const mfs = new MemoryFileSystem();
  const resolve = resolver(__dirname, '../../fixtures/projects/basic-typescript');

  // Mock fs calls to stats-manifest.json as these are used by sw-precache-plugin
  // to generate the service worker and will fail if not mocked
  const orgStatSync = fs.statSync;
  const orgReadFileSync = fs.readFileSync;
  fs.statSync = (p: any) => {
    if (/stats-manifest\.json/.test(p)) {
      return {
        ...mfs.statSync(p),
        size: mfs.meta(p).byteLength,
      };
    }
    return orgStatSync(p) as any;
  };
  fs.readFileSync = (p: any, options: any) => {
    if (/stats-manifest\.json/.test(p)) return mfs.readFileSync(p, options);
    return orgReadFileSync(p, options);
  };

  /**
   * Assertions
   */
  await expect(
    build({
      appDir: resolve(),
      outputFileSystem: mfs as any,
    }),
  ).resolves.toEqual(expect.objectContaining({}));

  // Unmock
  fs.statSync = orgStatSync;
  fs.readFileSync = orgReadFileSync;

  // Client
  expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/client/stats-manifest.json'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/client/service-worker.js'))).toBe(true);

  // Asset Manifest
  const assetManifest = JSON.parse(mfs.readFileSync(resolve('dist/client/asset-manifest.json')));
  expect(Object.keys(assetManifest)).toHaveLength(4);

  // CSS
  const css = getFiles(mfs, resolve('dist/client/static/css'));
  expect(css).toHaveLength(1);
  expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.css/);

  // JS
  const js = getFiles(mfs, resolve('dist/client/static/js'));
  expect(js).toHaveLength(isBrotliSupported ? 5 : 4);
  expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.js/);
  expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js/);

  if (isBrotliSupported) {
    expect(js[2].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.br/);
    expect(js[3].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.gz/);
    expect(js[4].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.LICENSE/);
  } else {
    expect(js[2].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.gz/);
    expect(js[3].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.LICENSE/);
  }

  // Server
  expect(hasFile(mfs, resolve('dist/server/bin/web.js'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/server/bin/web.js.map'))).toBe(true);
  expect(hasFile(mfs, resolve('dist/server/bin/stats-manifest.json'))).toBe(true);

  // Done
  done();
});
it('should support custom webpack config', async done => {
  jest.setTimeout(slowTimeout);
  expect.assertions(12);
  const mfs = new MemoryFileSystem();
  const resolve = resolver(__dirname, '../../fixtures/projects/basic');

  // Add current working directory as env variable
  process.env.TEST_USER_CWD = resolve();

  /**
   * Assertions
   */
  await expect(
    build({
      appDir: resolve(),
      outputFileSystem: mfs as any,
      configs: ['../../fixtures/webpack/customClient.js'].map(p => path.resolve(__dirname, p)),
    }),
  ).resolves.toEqual(expect.objectContaining({}));

  // Client
  expect(hasFile(mfs, resolve('dist/client/asset-manifest.json'))).toBe(true);

  // CSS
  const css = getFiles(mfs, resolve('dist/client/static/css'));
  expect(css).toHaveLength(2);
  expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.css/);
  expect(css[1].name).toMatch(/main\.([a-z0-9]{8})\.css\.map/);

  // JS
  expect(hasFile(mfs, resolve('dist/client/static/js'))).toBe(false);
  const js = getFiles(mfs, resolve('dist/client')).filter(
    f => f.isFile() && (f.name.endsWith('.js') || f.name.endsWith('.js.map')),
  );
  expect(js).toHaveLength(4);
  expect(js[0].name).toMatch('customFileName.js');
  expect(js[1].name).toMatch('customFileName.js.map');
  expect(js[2].name).toMatch(/customFileName\.vendor\.([a-z0-9]{8})\.chunk\.js/);
  expect(js[3].name).toMatch(/customFileName\.vendor\.([a-z0-9]{8})\.chunk\.js\.map/);

  // Server
  expect(hasFile(mfs, resolve('dist/server'))).toBe(false);

  // Done
  done();
});
