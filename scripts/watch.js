#!/usr/bin/env node

// Prepare
process.env.BABEL_ENV = process.env.NODE_ENV = 'development';

// Dependencies
const webpack = require('webpack');
const nodemon = require('nodemon');
const path = require('path');
const WebpackDevServer = require('webpack-dev-server');
const { createCompiler, prepareUrls, choosePort } = require('react-dev-utils/WebpackDevServerUtils');
const clearConsole = require('react-dev-utils/clearConsole');
const defaults = require('lodash.defaults');
const paths = require('../config/paths');
const pkg = require(path.resolve(paths.appDirectory, 'package.json'));

// Init
const isInteractive = process.stdout.isTTY;
const defaultOpts = {
  clientConfigFile: path.resolve(__dirname, '../webpack/client'),
  serverConfigFile: path.resolve(__dirname, '../webpack/server'),
  devServerHost: process.env.HOST || '0.0.0.0',
  devServerPort: parseInt(process.env.DEV_PORT, 10) || 3000,
  serverPort: parseInt(process.env.PORT, 10) || undefined,
};

// Helpers
const startServer = (compiler) => {
  compiler.watch({ ignored: '!**/server/**' }, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) console.error(err.details);
      process.exit(1);
    }
    const info = stats.toJson();
    if (stats.hasErrors()) console.error(info.errors.map(e => e.split('\n')));
    if (stats.hasWarnings()) console.warn(info.warnings);
  });

  // Add event handling
  const serverOutputEntry = path.resolve(compiler.options.output.path, compiler.options.output.filename);
  let watcher;
  compiler.hooks.done.tap(`${pkg.name}`, (stats) => {
    if (!watcher) {
      // Pass in arguments to child
      const launchArgs = process.argv.includes('--') ? process.argv.slice(process.argv.indexOf('--') + 1) : [];
      const debugArgs = [...new Set(launchArgs.concat(process.env.NODE_DEBUG_OPTION || []).filter(arg => arg.startsWith('--inspect') || arg.startsWith('--debug')))];
      const debugPort = (debugArgs.length > 0) ? process.debugPort + 1 : process.debugPort;
      const execArgs = launchArgs.filter(arg => !debugArgs.includes(arg)).concat(debugArgs.map(arg => arg.replace(process.debugPort, debugPort)));
      watcher = nodemon({ quiet: true, verbose: false, script: serverOutputEntry, watch: false, execArgs });

      watcher.on('log', log => console.info(log.colour));
      watcher.on('start', () => {
        if (watcher._shouldRestart) console.info('🔁  Server restarting');
        else console.info('✅  Server starting');
        watcher._shouldRestart = false;
      });
      watcher.on('exit', () => {
        watcher._shouldRestart = true;
        console.info('❌  Server stopped - waiting for changes to try again');
      });
      watcher.on('quit', () => {
        watcher._shouldRestart = true;
        console.info('❌  Server stopped - waiting for changes to try again');
      });
      watcher.on('error', (err) => {
        watcher._shouldRestart = true;
        console.error('❌  Server error - waiting for changes to try again');
        if (err) console.error(err);
      });
      watcher.on('crash', () => {
        watcher._shouldRestart = true;
        console.error('❌  Server crashed - waiting for changes to try again');
      });
    } else if (watcher._shouldRestart) watcher.restart();
    else console.info('🔁  Assets recompiled');
  });
};
const startDevServer = (compiler, port, host) => {
  const devServer = new WebpackDevServer(compiler, compiler.options.devServer);
  devServer.listen(port, host, (err) => {
    if (err) throw err;
    if (isInteractive) clearConsole();
  });

  // Handle closing
  ['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => { devServer.close(); process.exit(); }));

  return devServer;
};

// Run watcher
module.exports = async (options) => {
  const opts = defaults({}, options, defaultOpts);

  // Init
  const HOST = opts.devServerHost;
  const DEV_PORT = process.env.DEV_PORT = await choosePort(opts.devServerHost, opts.devServerPort);
  const PORT = process.env.PORT = await choosePort(opts.devServerHost, opts.serverPort || DEV_PORT + 1);
  let serverConfig;
  let clientConfig;

  // Load server configuration
  if (opts.serverConfigFile) {
    try {
      const rawServerConfig = require(opts.serverConfigFile);
      serverConfig = typeof rawServerConfig === 'function' ? rawServerConfig(opts) : rawServerConfig;
    } catch (err) {
      console.error('Failed to load server webpack config');
      console.error(err);
      process.exit(1);
    }
  }

  // Load client configuration
  if (opts.clientConfigFile) {
    try {
      const rawClientConfig = require(opts.clientConfigFile);
      clientConfig = typeof rawClientConfig === 'function' ? rawClientConfig(opts) : rawClientConfig;
    } catch (err) {
      console.error('Failed to load client webpack config');
      console.error(err);
      process.exit(1);
    }
  }

  // Prepare
  const urls = prepareUrls('http', HOST, DEV_PORT);
  const clientCompiler = clientConfig && createCompiler(webpack, clientConfig, pkg.name, urls, false);
  const serverCompiler = serverConfig && webpack(serverConfig);

  /**
   * Begin watching
   */

  // Should we start the server?
  if (serverCompiler) startServer(serverCompiler);

  // Should we start the devserver?
  if (clientCompiler) startDevServer(clientCompiler, DEV_PORT, HOST);
};
