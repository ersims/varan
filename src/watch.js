// Dependencies
const defaults = require('lodash.defaults');
const path = require('path');
const detectPort = require('detect-port-alt');
const compileAndRunDevServerFactory = require('./lib/compileAndRunDevServer');
const compileAndRunServerFactory = require('./lib/compileAndRunServer');
const logger = require('./lib/logger');
const getConfigs = require('./lib/getConfigs');

// Init
const getOpts = options =>
  defaults({}, options, {
    configs: [path.resolve(__dirname, '../webpack/client'), path.resolve(__dirname, '../webpack/server')],
    devServerHost: process.env.HOST || 'localhost',
    devServerPort: parseInt(process.env.DEV_PORT, 10) || 3000,
    serverHost: process.env.HOST || 'localhost',
    serverPort: parseInt(process.env.PORT, 10) || undefined,
    silent: false,
    env: 'development',
    cwd: process.cwd(),
    args: process.argv.includes('--') ? process.argv.slice(process.argv.indexOf('--') + 1) : [],
    openBrowser: false,
    waitForServer: true,
  });

// Exports
module.exports = async options => {
  const opts = getOpts(options);
  const log = logger(opts);
  const compileAndRunDevServer = compileAndRunDevServerFactory(log);
  const compileAndRunServer = compileAndRunServerFactory(log);
  process.env.BABEL_ENV = opts.env;
  opts.devServerPort = await detectPort(opts.devServerPort, opts.devServerHost);
  opts.serverPort = process.env.PORT = await detectPort(
    (opts.serverPort && opts.serverPort !== opts.devServerPort && opts.serverPort) || opts.devServerPort + 1,
    opts.serverHost,
  );
  opts.serverHost = process.env.HOST = opts.serverHost;
  opts.devServerWSPort = await detectPort(opts.devServerPort + 10, opts.devServerHost);

  // Load configs
  if (opts.configs.length > 2)
    throw new Error('Too many config files provided. Maximum two config files are supported in `watch` mode.');
  const configs = getConfigs(opts.configs, opts);
  const clientConfig = configs.find(c => !c.target || c.target === 'web');
  const serverConfig = configs.find(c => c.target === 'node');

  // Check if config is valid
  if (configs.length >= 2 && (!clientConfig || !serverConfig)) {
    throw new Error('One or more invalid config files provided. Maximum of one config file per target is supported.');
  }

  // Set proxy based on server presence
  opts.devServerProxy = !!serverConfig;

  /**
   * Begin watching
   */
  const devServerPromise =
    clientConfig && compileAndRunDevServer(clientConfig, opts.devServerHost, opts.devServerPort, opts);
  return Promise.all(
    [devServerPromise, serverConfig && compileAndRunServer(serverConfig, opts, devServerPromise)].filter(Boolean),
  );
};
