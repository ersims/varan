// Dependencies
const defaults = require('lodash.defaults');
const path = require('path');
const detectPort = require('detect-port-alt');
const compileAndRunDevServerFactory = require('./lib/compileAndRunDevServer');
const compileAndRunServerFactory = require('./lib/compileAndRunServer');
const logger = require('./lib/logger');

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

// Exports
module.exports = async (options) => {
  const opts = getOpts(options);
  const log = logger(opts);
  const compileAndRunDevServer = compileAndRunDevServerFactory(log);
  const compileAndRunServer = compileAndRunServerFactory(log);
  process.env.BABEL_ENV = process.env.NODE_ENV = opts.env;
  const DEV_PORT = process.env.DEV_PORT = await detectPort(opts.devServerPort, opts.devServerHost);
  process.env.PORT = await detectPort((opts.serverPort && opts.serverPort !== DEV_PORT && opts.serverPort) || DEV_PORT + 1, opts.serverHost);

  // Check for required files
  if (!opts.clientConfigFile && !opts.serverConfigFile) throw new Error('Must specify at least one config file to watch');

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
    serverConfig && compileAndRunServer(serverConfig, opts.nodemonArgs),
  ].filter(Boolean));
};
