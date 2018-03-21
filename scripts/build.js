#!/usr/bin/env node

// Prepare
process.env.BABEL_ENV = process.env.NODE_ENV = 'production';

// Dependencies
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');
const pkg = require('../package.json');
const defaultClientConfig = require('../config/webpack/client');
const defaultServerConfig = require('../config/webpack/server');

// Init
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

// Run builder
module.exports = ({ configFile } = {}) => {
  let config = defaultClientConfig();
  let serverConfig = defaultServerConfig();
  if (configFile) {
    try {
      config = require(path.resolve(fs.realpathSync(process.cwd()), configFile));
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  // Init
  const compiler = webpack([config, serverConfig]);

  // Add event handling
  compiler.hooks.done.tap(`${pkg.name}`, () => console.info('✅  Assets compiled'));

  // Run
  measureFileSizesBeforeBuild(config.output.path).then((previousFileSizes) => {
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
      printFileSizesAfterBuild(stats.stats[0], previousFileSizes, config.output.path, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
      console.log();
    });
  })

};
