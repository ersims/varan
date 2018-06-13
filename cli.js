#!/usr/bin/env node

// Dependencies
const program = require('commander');
const path = require('path');
const pkg = require('./package.json');
const { init } = require('./index');
const { build } = require('./index');
const { watch } = require('./index');

// Init
process.on('unhandledRejection', (err) => { throw err; });
const resolve = file => file && path.resolve(process.cwd(), file);

// Setup program
program
  .usage('<command> [options]')
  .version(pkg.version);

/**
 * Create a new project
 */
program
  .command('init')
  .arguments('<name>')
  .option('--template <project template>', 'Specify project template - see examples directory for the different templates')
  .action((name, opts) => init({ name, template: opts.template }).catch(err => console.error(err)));


/**
 * Build application for production
 */
program
  .command('build [files...]')
  .option('--env <environment>', 'Environment to use. Defaults to production')
  .action((files, opts) => build({
    configs: (files.length > 0 && files.map(resolve)) || undefined,
    env: opts && opts.env,
  }).catch(err => console.error(err)));

/**
 * Development watching mode
 */
program
  .command('watch')
  .usage('[options] -- [server args]')
  .option('--client [config file]', 'Specify client webpack configuration file', resolve)
  .option('--server [config file]', 'Specify server webpack configuration file', resolve)
  .option('--no-client', 'Disable client watching')
  .option('--no-server', 'Disable server watching')
  .option('--host <host>', 'Specify host for both client and server to bind on')
  .option('--client-port <port number>', 'Specify client dev server port to listen on', port => parseInt(port, 10))
  .option('--server-port <port number>', 'Specify server port to listen on', port => parseInt(port, 10))
  .option('--env <development|production>', 'Environment to use')
  .allowUnknownOption()
  .action((extra, opts) => {
    if (!opts) opts = extra;
    return watch({
      serverConfigFile: opts && opts.server && (opts.server !== true ? resolve(opts.server) : path.resolve(__dirname, './webpack/server')),
      clientConfigFile: opts && opts.client && (opts.client !== true ? resolve(opts.client) : path.resolve(__dirname, './webpack/client')),
      devServerHost: opts && opts.host,
      devServerPort: opts && opts.clientPort,
      serverHost: opts && opts.host,
      serverPort: opts && opts.serverPort,
      env: opts && opts.env,
    }).catch(err => console.error(err));
  });

// Run
if (!process.argv.slice(2).length) program.outputHelp();
else program.parse(process.argv);
