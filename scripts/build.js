#!/usr/bin/env node

// Prepare
process.env.BABEL_ENV = process.env.NODE_ENV = 'production';

// Dependencies
const webpack = require('webpack');
const path = require('path');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');
const clearConsole = require('react-dev-utils/clearConsole');
const defaultsDeep = require('lodash.defaultsdeep');
const paths = require('../config/paths');
const pkg = require(path.resolve(paths.appDirectory, 'package.json'));

// Init
const isInteractive = process.stdout.isTTY;
const defaultOpts = {
  configFiles: [],
};
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

// Run watcher
module.exports = async (options) => {
  const opts = defaultsDeep({}, options, defaultOpts);

  // Load configurations
  let configs;
  try {
    configs = opts.configFiles.map((configFile) => {
      const rawConfig = require(configFile);
      return typeof rawConfig === 'function' ? rawConfig(opts) : rawConfig;
    });
  } catch (err) {
    console.error('Failed to load webpack config');
    console.error(err);
    process.exit(1);
  }

  // Prepare
  const compiler = webpack(configs);

  /**
   * Begin compiling
   */

  // Add event handling
  compiler.hooks.done.tap(`${pkg.name}`, () => console.info('✅  Assets compiled'));

  // Run
  Promise.all(configs.map(config => measureFileSizesBeforeBuild(config.output.path)))
    .then((previousFileSizes) => {
      compiler.run((err, stats) => {
        if (err) {
          console.error(err.stack || err);
          if (err.details) console.error(err.details);
          process.exit(1);
        }

        const info = stats.toJson();
        if (stats.hasErrors()) console.error(info.errors.map(e => e.split('\n')));
        if (stats.hasWarnings()) console.warn(info.warnings);

        console.log('File sizes after gzip:\n');
        configs.forEach((config, i) => {
          console.log(`\nInput config file: ${opts.configFiles[i]}\nOutput directory: ${path.resolve(config.output.path, '..')}`);
          printFileSizesAfterBuild(stats.stats[i], previousFileSizes[i], config.output.path, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
        });
        console.log();
      });
  })
};
