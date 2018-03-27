#!/usr/bin/env node

// Dependencies
const program = require('commander');
const path = require('path');
const pkg = require('./package.json');

// Init
process.on('unhandledRejection', (err) => { throw err; });
const resolve = file => file && path.resolve(process.cwd(), file);

// Setup program
program
  .usage('<command> [options]')
  .version(pkg.version);

/**
 * Build application for production
 */
program
  .command('build [files...]')
  .action(cmd => require('./scripts/build')({
    configFiles: cmd.length > 0
      ? cmd.map(resolve)
      : undefined,
  }));

/**
 * Development watching mode
 */
program
  .command('watch')
  .usage('[options] -- [nodemon args]')
  .option('--client [config file]', 'Specify client webpack configuration file', resolve)
  .option('--server [config file]', 'Specify server webpack configuration file', resolve)
  .option('--no-client', 'Disable client watching')
  .option('--no-server', 'Disable server watching')
  .option('--host <host>', 'Specify host for both client and server to bind on')
  .option('--client-port <port number>', 'Specify client dev server port to listen on', port => parseInt(port, 10))
  .option('--server-port <port number>', 'Specify server port to listen on', port => parseInt(port, 10))
  .allowUnknownOption()
  .action((cmd, opts) => require('./scripts/watch')({
    serverConfigFile: opts && opts.server && (opts.server !== true ? opts.server : path.resolve(__dirname, './webpack/server')),
    clientConfigFile: opts && opts.client && (opts.client !== true ? opts.client : path.resolve(__dirname, './webpack/client')),
    devServerHost: opts && opts.host,
    devServerPort: opts && opts.clientPort,
    serverPort: opts && opts.serverPort,
  }));

// Run
if (!process.argv.slice(2).length) program.outputHelp();
else program.parse(process.argv);
