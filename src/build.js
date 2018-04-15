// Dependencies
const defaults = require('lodash.defaults');
const webpack = require('webpack');
const path = require('path');
const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = require('react-dev-utils/FileSizeReporter');
const omit = require('lodash.omit');
const logger = require('./lib/logger');
const getConfigs = require('./lib/getConfigs');
const pkg = require('../package.json');

// Init
const getOpts = options =>
  defaults({}, options, {
    configs: ['../webpack/client.js', '../webpack/server.js'].map(configFile => path.resolve(__dirname, configFile)),
    warnBundleSize: 512 * 1024,
    warnChunkSize: 1024 * 1024,
    silent: false,
    env: 'production',
    inputFileSystem: undefined,
    outputFileSystem: undefined,
  });

// Exports
module.exports = async options => {
  const opts = getOpts(options);
  const log = logger(opts);
  process.env.BABEL_ENV = opts.env;

  // Load configs
  const configs = getConfigs(opts.configs, opts);

  // Prepare webpack compiler
  const compiler = webpack(configs.map(c => omit(c, ['serve'])));
  if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

  // Add event handlers
  compiler.hooks.done.tap(pkg.name, () => log('✅  Build complete'));

  /**
   * Begin compile
   */
  log('🔁  Building...');
  return Promise.all(compiler.compilers.map(c => measureFileSizesBeforeBuild(c.options.output.path))).then(
    previousFileSizes =>
      new Promise((resolve, reject) => {
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
          compiler.compilers.forEach((c, i) => {
            const config = c.options;
            log(`
Input config (${i}):  ${path.resolve(typeof opts.configs[i] === 'string' ? opts.configs[i] : config.name || i)}
Output path:          ${path.dirname(config.output.path)}
      `);
            if (!opts.silent)
              printFileSizesAfterBuild(
                stats.stats[i],
                previousFileSizes[i],
                config.output.path,
                opts.warnBundleSize,
                opts.warnChunkSize,
              );
          });
          log();
          resolve(stats);
        });
      }),
  );
};
