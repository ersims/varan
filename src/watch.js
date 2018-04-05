// Dependencies
const defaults = require('lodash.defaults');
const path = require('path');
const detectPort = require('detect-port-alt');
const compileAndRunDevServerFactory = require('./lib/compileAndRunDevServer');
const compileAndRunServerFactory = require('./lib/compileAndRunServer');
const logger = require('./lib/logger');
const getConfigs = require('./lib/getConfigs');

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
  process.env.BABEL_ENV  = opts.env;
  opts.devServerPort = await detectPort(opts.devServerPort, opts.devServerHost);
  opts.serverPort = process.env.PORT = await detectPort((opts.serverPort && opts.serverPort !== opts.devServerPort && opts.serverPort) || opts.devServerPort + 1, opts.serverHost);
  opts.serverHost = process.env.HOST = opts.serverHost;

  // Load configs
  const [clientConfig, serverConfig] = getConfigs([opts.clientConfigFile, opts.serverConfigFile], opts);

  /**
   * Begin watching
   */
  return Promise.all([
    clientConfig && compileAndRunDevServer(clientConfig, opts.devServerHost, opts.devServerPort),
    serverConfig && compileAndRunServer(serverConfig, opts.nodemonArgs),
  ].filter(Boolean));
};
