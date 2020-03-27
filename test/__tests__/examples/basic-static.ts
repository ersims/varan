import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';
import { listFiles } from '../../fixtures/utils';

// Init
const slowTimeout = 40000;
const dir = path.join(__dirname, '..', '..', '..', 'examples', 'basic-static');

// Tests
beforeEach(() => {
  fs.removeSync(path.join(dir, 'dist'));
  process.chdir(dir);
});
it('watches successfully', async (done) => {
  jest.setTimeout(slowTimeout);
  expect.assertions(7);

  // Assertions
  const runner = execa.node('../../packages/varan/varan', ['watch', '--client-port=12345', './webpack.config.js'], {
    timeout: slowTimeout - 10000,
  });

  // Wait for watcher ready
  try {
    await new Promise((resolve, reject) => {
      if (!runner.stderr) reject(new Error('No stderr from watcher'));
      else if (!runner.stdout) reject(new Error('No stdout from watcher'));
      else {
        runner.stderr.once('data', (e) => reject(e.toString()));
        runner.stdout.on('data', async (data) => {
          if (data.includes('Development server is now ready and you can view your project in the browser')) {
            resolve();
          }
        });
      }
    });

    // Client
    expect(fs.existsSync('dist/asset-manifest.json')).toBe(true);
    expect(fs.existsSync('dist/stats-manifest.json')).toBe(true);
    expect(fs.existsSync('dist/static/css')).toBe(false);
    expect(fs.existsSync('dist/static/js')).toBe(false);

    // JS
    expect(fs.existsSync('dist/dev-bundle.js')).toBe(true);
    expect(fs.existsSync('dist/dev-bundle.js.map')).toBe(true);

    // Server
    expect(fs.existsSync('dist/server')).toBe(false);
  } finally {
    await runner.kill();

    // Done
    done();
  }
});
it('builds successfully', async (done) => {
  jest.setTimeout(slowTimeout);
  expect.assertions(25);

  // Assertions
  const runner = execa.node('../../packages/varan/varan', ['build', './webpack.config.js'], {
    timeout: slowTimeout - 10000,
  });

  // Wait for builder ready
  try {
    await expect(runner).resolves.toEqual(expect.objectContaining({}));

    // Client
    expect(fs.existsSync('dist/asset-manifest.json')).toBe(true);
    expect(fs.existsSync('dist/stats-manifest.json')).toBe(true);

    // Asset Manifest
    const assetManifest = fs.readJSONSync('dist/asset-manifest.json');
    expect(Object.keys(assetManifest)).toHaveLength(6);
    expect(assetManifest).toEqual(
      expect.objectContaining({
        'index.html': expect.objectContaining({
          src: 'index.html',
          integrity: expect.stringMatching(/sha512-(.){32}/i),
        }),
      }),
    );

    // CSS
    const css = listFiles('dist/static/css');
    expect(css).toHaveLength(1);
    expect(css[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.css/);
    expect(css[0].size).toBeGreaterThan(0);
    expect(css[0].size).toBeLessThan(20 * 1024);

    // JS
    const js = listFiles('dist/static/js');
    expect(js).toHaveLength(5);
    expect(js[0].name).toMatch(/main\.([a-z0-9]{8})\.([a-z0-9]{8})\.js/);

    expect(js[1].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js/);
    expect(js[2].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.br/);
    expect(js[3].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.gz/);
    expect(js[4].name).toMatch(/vendor\.([a-z0-9]{8})\.([a-z0-9]{8})\.chunk\.js\.LICENSE/);

    // main.js
    expect(js[0].size).toBeGreaterThan(0);
    expect(js[0].size).toBeLessThan(5 * 1024);

    // vendor.js
    expect(js[1].size).toBeGreaterThan(0);
    expect(js[1].size).toBeLessThan(200 * 1024);

    // vendor.js - Brotli
    expect(js[2].size).toBeGreaterThan(0);
    expect(js[2].size).toBeLessThan(70 * 1024);
    expect(js[2].size).toBeLessThan(js[3].size as number);

    // vendor.js - Gzip
    expect(js[3].size).toBeGreaterThan(0);
    expect(js[3].size).toBeLessThan(70 * 1024);

    // Server
    expect(fs.existsSync('dist/server')).toBe(false);
  } finally {
    await runner.kill();

    // Done
    done();
  }
});
