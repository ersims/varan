// Dependencies
const defaults = require('lodash.defaults');
const webpack = require('webpack');
const nodemon = require('nodemon');
const path = require('path');
const {
  createCompiler,
  prepareUrls,
  choosePort,
} = require('react-dev-utils/WebpackDevServerUtils');
const WebpackDevServer = require('webpack-dev-server');
const pkg = require('../package.json');

// Init
const getOpts = (options) => defaults({}, options, {
  clientConfigFile: path.resolve(__dirname, '../webpack/client'),
  serverConfigFile: path.resolve(__dirname, '../webpack/server'),
  devServerHost: process.env.HOST || '0.0.0.0',
  devServerPort: parseInt(process.env.DEV_PORT, 10) || 3000,
  serverHost: process.env.HOST || 'localhost',
  serverPort: parseInt(process.env.PORT, 10) || undefined,
  silent: false,
  env: 'development',
  cwd: process.cwd(),
  nodemonArgs: process.argv,
});
const compileAndRunDevServerFactory = log => async (config, host, port) => {
  const name = config.name || pkg.name;
  const urls = prepareUrls('http', host, port);
  const compiler = createCompiler(webpack, config, name, urls, false);
  if (compiler.options.devServer) {
    const devServer = new WebpackDevServer(compiler, compiler.options.devServer);
    devServer.listen(port, host, (err) => {
      if (err) throw err;
    });

    // Handle closing
    ['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
      devServer.close();
      process.exit();
    }));
    return devServer;
  } else {
    compiler.hooks.done.tap(pkg.name, () => log(`✅  Build complete for ${name}`));
    return new Promise((resolve, reject) => compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        return reject(err);
      }

      const info = stats.toJson();
      if (stats.hasErrors()) {
        console.error(info.errors.map(e => e.split('\n')));
        const error = new Error('Build failed for ${name}');
        error.details = info.errors;
        return reject(error);
      }
      if (stats.hasWarnings()) console.warn(info.warnings);
      resolve();
    }));
  }
};
const compileAndRunServerFactory = log => async (config, args) => {
  const compiler = webpack(config);
  compiler.watch({}, (err, stats) => {
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
  compiler.hooks.done.tap(pkg.name, (stats) => {
    if (!watcher) {
      // Pass in arguments to child
      const launchArgs = args.includes('--') ? args.slice(args.indexOf('--') + 1) : [];
      const debugArgs = [...new Set(launchArgs.concat(process.env.NODE_DEBUG_OPTION || []).filter(arg => arg.startsWith('--inspect') || arg.startsWith('--debug')))];
      const debugPort = (debugArgs.length > 0) ? process.debugPort + 1 : process.debugPort;
      const execArgs = launchArgs.filter(arg => !debugArgs.includes(arg)).concat(debugArgs.map(arg => arg.replace(process.debugPort, debugPort)));
      watcher = nodemon({ quiet: true, verbose: false, script: serverOutputEntry, watch: false, execArgs });

      watcher.on('log', log);
      watcher.on('start', () => {
        if (watcher._shouldRestart) log('🔁  Server restarting');
        else log('✅  Server starting');
        watcher._shouldRestart = false;
      });
      watcher.on('exit', () => {
        watcher._shouldRestart = true;
        log('❌  Server stopped - waiting for changes to try again');
      });
      watcher.on('quit', () => {
        watcher._shouldRestart = true;
        log('❌  Server stopped - waiting for changes to try again');
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
    else log('🔁  Assets recompiled');
  });
};

// Exports
module.exports = async (options) => {
  const opts = getOpts(options);
  const log = (output = '') => !opts.silent && console.log(output);
  const compileAndRunDevServer = compileAndRunDevServerFactory(log);
  const compileAndRunServer = compileAndRunServerFactory(log);
  process.env.BABEL_ENV = process.env.NODE_ENV = opts.env;
  const DEV_PORT = process.env.DEV_PORT = await choosePort(opts.devServerHost, opts.devServerPort);
  process.env.PORT = await choosePort(opts.serverHost, opts.serverPort || DEV_PORT + 1);

  // Check for required files
  if (!opts.clientConfigFile && !opts.serverConfigFile === 0) throw new Error('Must specify at least one config file to watch');

  // Load config files
  const [clientConfig, serverConfig] = [opts.clientConfigFile, opts.serverConfigFile]
    .map((configFile) => {
      if (!configFile) return;
      const rawConfig = require(configFile);
      return typeof rawConfig === 'function' ? rawConfig(opts) : rawConfig;
    });

  /**
   * Begin watching
   */
  return Promise.all([
    clientConfig && compileAndRunDevServer(clientConfig, opts.devServerHost, DEV_PORT),
    serverConfig && compileAndRunServer(serverConfig, opts.nodemonArgs)
  ].filter(Boolean));
};
