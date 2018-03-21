#!/usr/bin/env node

// Dependencies
const webpack = require('webpack');
const nodemon = require('nodemon');
const fs = require('fs');
const path = require('path');
const WebpackDevServer = require('webpack-dev-server');
const { createCompiler, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const clearConsole = require('react-dev-utils/clearConsole');
const pkg = require('../package.json');
const defaultServerConfig = require('../config/webpack/server');
const defaultClientConfig = require('../config/webpack/client');

// Init
process.on('unhandledRejection', (err) => { throw err; });
const isInteractive = process.stdout.isTTY;
const PORT = parseInt(process.env.PORT, 10) || 3000;
const DEV_PORT = parseInt(process.env.DEV_PORT, 10) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Run watcher
module.exports = ({ configFile } = {}) => {
  let config = defaultServerConfig();
  const clientConfig = defaultClientConfig({ devPort: DEV_PORT });
  if (configFile) {
    try {
      config = require(path.resolve(fs.realpathSync(process.cwd()), configFile));
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  // Init
  const binary = path.resolve(config.output.path, config.output.filename);
  const urls = prepareUrls('http', HOST, PORT);
  const serverCompiler = webpack(config);
  const clientCompiler = createCompiler(webpack, clientConfig, pkg.name, urls, false);

  /**
   * Run
   */
  let devServer;
  serverCompiler.watch({ ignored: '!**/server/**' }, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) console.error(err.details);
      process.exit(1);
    }

    const info = stats.toJson();
    if (stats.hasErrors()) console.error(info.errors.map(e => e.split('\n')));
    if (stats.hasWarnings()) console.warn(info.warnings);

    // Start devserver if it has not been started yet
    if (!devServer) {
      console.log('Starting the client HMR server...\n');
      devServer = new WebpackDevServer(clientCompiler, clientConfig.devServer);
      devServer.listen(clientConfig.devServer.port, HOST, (err) => {
        if (err) throw err;
        if (isInteractive) clearConsole();
      });

      // Handle closing
      ['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => { devServer.close(); process.exit(); }));
    }
  });

  // Add event handling
  let watcher;
  serverCompiler.hooks.done.tap(`${pkg.name}`, (stats) => {
    if (!watcher) {
      // Pass in arguments to child
      const debugArgs = [...new Set(process.execArgv.concat(process.env.NODE_DEBUG_OPTION || []).filter(arg => arg.startsWith('--inspect') || arg.startsWith('--debug')))];
      const debugPort = (debugArgs.length > 0) ? process.debugPort + 1 : process.debugPort;
      const execArgs = process.execArgv.filter(arg => !debugArgs.includes(arg)).concat(debugArgs.map(arg => arg.replace(process.debugPort, debugPort)));
      watcher = nodemon({ quiet: true, verbose: false, script: binary, watch: false, execArgs });

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
