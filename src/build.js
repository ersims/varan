// Dependencies
const defaults = require('lodash.defaults');
const webpack = require('webpack');
const path = require('path');
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter');
const pkg = require('../package.json');

// Init
const getOpts = (options) => defaults({}, options, {
  configFiles: [
    '../webpack/client.js',
    '../webpack/server.js'
  ].map(p => path.resolve(__dirname, p)),
  warnBundleSize: 512 * 1024,
  warnChunkSize: 1024 * 1024,
  silent: false,
  env: 'production',
  cwd: process.cwd(),
});

// Exports
module.exports = async (options) => {
  const opts = getOpts(options);
  const log = (output = '') => !opts.silent && console.log(output);
  process.env.BABEL_ENV = process.env.NODE_ENV = opts.env;

  // Check for required files
  if (!opts.configFiles || opts.configFiles.length === 0) throw new Error('Must specify at least one config file to build');

  // Load config files
  const configs = opts.configFiles.map((configFile) => {
    const rawConfig = require(configFile);
    return typeof rawConfig === 'function' ? rawConfig(opts) : rawConfig;
  });

  // Prepare webpack compiler
  const compiler = webpack(configs);

  // Add event handlers
  compiler.hooks.done.tap(pkg.name, () => log('✅  Build complete'));

  /**
   * Begin compile
   */
  log('🔁  Building...');
  return Promise.all(configs.map(config => measureFileSizesBeforeBuild(config.output.path)))
    .then((previousFileSizes) => new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          console.error(err.stack || err);
          if (err.details) console.error(err.details);
          return reject(err);
        }

        const info = stats.toJson();
        if (stats.hasErrors()) {
          console.error(info.errors.map(e => e.split('\n')));
          const error = new Error('Build failed');
          error.details = info.errors;
          return reject(error);
        }
        if (stats.hasWarnings()) console.warn(info.warnings);

        log('Potential file sizes after gzip:\n');
        configs.forEach((config, i) => {
          log(`
  Input file:   ${path.resolve(opts.configFiles[i])}
  Output path:  ${path.dirname(config.output.path)}
          `);
          if (!opts.silent) printFileSizesAfterBuild(stats.stats[i], previousFileSizes[i], config.output.path, opts.warnBundleSize, opts.warnChunkSize);
        });
        log();
        resolve();
      });
    }));
};
