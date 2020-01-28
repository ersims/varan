import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';
import { listFiles } from '../../fixtures/utils';

// Init
const slowTimeout = 40000;
const dir = path.join(__dirname, '..', '..', '..', 'examples', 'basic');

// Tests
beforeEach(() => {
  fs.removeSync(path.join(dir, 'dist'));
  process.chdir(dir);
});
it('watches successfully', async done => {
  jest.setTimeout(slowTimeout);
  expect.assertions(10);

  // Assertions
  const runner = execa.node('../../packages/varan/varan', ['watch', '--client-port=12340'], {
    timeout: slowTimeout - 10000,
  });

  // Wait for watcher ready
  try {
    await new Promise((resolve, reject) => {
      if (!runner.stderr) reject(new Error('No stderr from watcher'));
      else if (!runner.stdout) reject(new Error('No stdout from watcher'));
      else {
        runner.stderr.once('data', e => reject(e.toString()));
        runner.stdout.on('data', async data => {
          if (data.includes('Development server is now ready and you can view your project in the browser')) {
            resolve();
          }
        });
      }
    });

    // Client
    expect(fs.existsSync('dist/client/asset-manifest.json')).toBe(true);
    expect(fs.existsSync('dist/client/stats-manifest.json')).toBe(true);
    expect(fs.existsSync('dist/client/service-worker.js')).toBe(false);
    expect(fs.existsSync('dist/client/static/css')).toBe(false);
    expect(fs.existsSync('dist/client/static/js')).toBe(false);

    // JS
    expect(fs.existsSync('dist/client/dev-bundle.js')).toBe(true);
    expect(fs.existsSync('dist/client/dev-bundle.js.map')).toBe(true);

    // Server
    expect(fs.existsSync('dist/server/bin/web.js')).toBe(true);
    expect(fs.existsSync('dist/server/bin/web.js.map')).toBe(true);
    expect(fs.existsSync('dist/server/bin/stats-manifest.json')).toBe(true);
  } finally {
    await runner.kill();

    // Done
    done();
  }
});
it('builds successfully', async done => {
  jest.setTimeout(slowTimeout);
  expect.assertions(35);

  // Assertions
  const runner = execa.node('../../packages/varan/varan', ['build'], { timeout: slowTimeout - 10000 });

  // Wait for builder ready
  try {
    await expect(runner).resolves.toEqual(expect.objectContaining({}));

    // Client
    expect(fs.existsSync('dist/client/asset-manifest.json')).toBe(true);
    expect(fs.existsSync('dist/client/stats-manifest.json')).toBe(true);
    expect(fs.existsSync('dist/client/service-worker.js')).toBe(true);

    // Asset Manifest
    const assetManifest = fs.readJSONSync('dist/client/asset-manifest.json');
    expect(Object.keys(assetManifest)).toHaveLength(6);
    expect(assetManifest).toEqual(
      expect.objectContaining({
        'static/media/favicon.ico': expect.objectContaining({
          src: expect.stringMatching(/static\/media\/favicon\.[a-f0-9]{8}\.ico/i),
          integrity: expect.stringMatching(/sha512-(.){32}/i),
        }),
      }),
    );

    // CSS
    const css = listFiles('dist/client/static/css');
    expect(css).toHaveLength(1);
    expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.css/);
    expect(css[0].size).toBeGreaterThan(0);
    expect(css[0].size).toBeLessThan(20 * 1024);

    // JS
    const js = listFiles('dist/client/static/js');
    expect(js).toHaveLength(7);
    expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.js/);

    expect(js[1].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.js.br/);
    expect(js[2].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.js.gz/);
    expect(js[3].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js/);
    expect(js[4].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.br/);
    expect(js[5].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.gz/);
    expect(js[6].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.LICENSE/);

    // main.js
    expect(js[0].size).toBeGreaterThan(0);
    expect(js[0].size).toBeLessThan(5 * 1024);

    // main.js - Brotli
    expect(js[1].size).toBeGreaterThan(0);
    expect(js[1].size).toBeLessThan(2 * 1024);
    expect(js[1].size).toBeLessThan(js[2].size);

    // main.js - Gzip
    expect(js[2].size).toBeGreaterThan(0);
    expect(js[2].size).toBeLessThan(2 * 1024);

    // vendor.js
    expect(js[3].size).toBeGreaterThan(0);
    expect(js[3].size).toBeLessThan(200 * 1024);

    // vendor.js - Brotli
    expect(js[4].size).toBeGreaterThan(0);
    expect(js[4].size).toBeLessThan(70 * 1024);
    expect(js[4].size).toBeLessThan(js[5].size);

    // vendor.js - Gzip
    expect(js[5].size).toBeGreaterThan(0);
    expect(js[5].size).toBeLessThan(70 * 1024);

    // Server
    expect(fs.existsSync('dist/server/bin/web.js')).toBe(true);
    expect(fs.existsSync('dist/server/bin/web.js.map')).toBe(true);
    expect(fs.existsSync('dist/server/bin/stats-manifest.json')).toBe(true);
  } finally {
    await runner.kill();

    // Done
    done();
  }
});
