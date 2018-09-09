#!/usr/bin/env node
import 'source-map-support/register';

// Dependencies
import program from 'commander';
import path from 'path';
import updateNotifier from 'update-notifier';
import inquirer from 'inquirer';
import { build, init, watch } from '../index';
import emojis from '../lib/emojis';
import chalk from 'chalk';
import createLogger from '../lib/createLogger';
import Signals = NodeJS.Signals;

// tslint:disable-next-line no-var-requires
const pkg = require('../../package.json');

// Types
const enum TemplateTypes {
  ADVANCED = 'ADVANCED',
  BASIC = 'BASIC',
}

// Init
process.on('unhandledRejection', err => {
  throw err;
});
const resolve = (file: string) => file && path.resolve(process.cwd(), file);

// Check for updates
updateNotifier({ pkg }).notify();

// Setup program
program.usage('<command> [options]').version(pkg.version);

/**
 * Create a new project
 */
program
  .command('init')
  .arguments('<name>')
  .option('-a, --advanced', 'Use advanced boilerplate from https://github.com/ersims/varan-boilerplate? Requires git!')
  .option('-b, --basic', 'Use the basic boilerplate')
  .option('-s, --silent', 'Disable output')
  .action(async (name, opts) => {
    const log = createLogger({ silent: opts.silent });
    try {
      if (opts.basic && opts.advanced)
        throw new Error('Cannot specify both basic and advanced template type. You must choose one.');
      else if (!opts.basic && !opts.advanced) {
        const answer = await inquirer.prompt<{ templateType: TemplateTypes }>([
          {
            type: 'list',
            name: 'templateType',
            message: 'Which boilerplate do you want to use?',
            choices: [
              {
                name: 'Basic (recommended)',
                value: TemplateTypes.BASIC,
              },
              {
                name: 'Advanced (see https://github.com/ersims/varan-boilerplate)',
                value: TemplateTypes.ADVANCED,
              },
            ],
          },
        ]);
        if (answer.templateType === TemplateTypes.ADVANCED) opts.advanced = true;
      }
      await init({
        name,
        fromGitRepo: opts.advanced && 'https://github.com/ersims/varan-boilerplate',
        ...opts,
      });
    } catch (err) {
      log.error();
      log.error(
        `  ${chalk.red(emojis.failure)} Failure! Project ${chalk.cyan(name)} could not be created ${chalk.red(
          emojis.failure,
        )}`,
      );
      if (err.details) log.error(`  ${chalk.cyan('Details:')} ${err.details}`);
      if (err.stack) log.error(`  ${err.stack}`);
      log.error();
    }
  });

/**
 * Build application
 */
program
  .command('build [files...]')
  .option('--env <environment>', 'Environment to use. Defaults to production')
  .option('-a, --analyze', 'Analyze build')
  .option('-s, --silent', 'Disable output')
  .action(async (files, opts) => {
    const log = createLogger({ silent: opts.silent });
    try {
      await build({
        configs: (files.length > 0 && files.map(resolve)) || undefined,
        ...opts,
      });
    } catch (err) {
      log.error();
      log.error(`  ${chalk.red(emojis.failure)} Failure! Failed to build project ${chalk.red(emojis.failure)}`);
      if (err.details) log.error(`  ${chalk.cyan('Details:')} ${err.details}`);
      if (err.stack) log.error(`  ${err.stack}`);
      log.error();
    }
  });

/**
 * Development watching mode
 */
program
  .command('watch [files...]')
  .usage('[options] [files...] -- --inspect')
  .option('-s, --silent', 'Disable output')
  .option('--host <host>', 'Specify host for both client and server to bind on')
  .option('--client-port <port number>', 'Specify client dev server port to listen on', port => parseInt(port, 10))
  .option('--server-port <port number>', 'Specify server port to listen on', port => parseInt(port, 10))
  .option('--env <development|production>', 'Environment to use')
  .option('--open', 'Open app in browser automatically?')
  .action(async (rawFiles: string[], opts) => {
    const log = createLogger({ silent: opts.silent });
    opts.args = process.argv.includes('--') ? process.argv.slice(process.argv.indexOf('--') + 1) : [];
    const files = rawFiles.filter(f => !opts.args.includes(f));
    try {
      const watcher = await watch({
        configs: (files.length > 0 && files.map(resolve)) || [
          path.resolve(__dirname, '../../webpack/server'),
          path.resolve(__dirname, '../../webpack/client'),
        ],
        devServerHost: opts && opts.host,
        devServerPort: opts && opts.clientPort,
        serverHost: opts && opts.host,
        serverPort: opts && opts.serverPort,
        args: opts && opts.args,
        env: opts && opts.env,
        openBrowser: opts && opts.open,
        silent: opts && opts.silent,
      });
      (['SIGTERM', 'SIGINT'] as Signals[]).forEach((signal: Signals) =>
        process.on(signal, async () => {
          try {
            let isDone = false;
            await Promise.race([
              watcher.close().then(() => {
                isDone = true;
              }),
              new Promise(resolvePromise => setTimeout(() => !isDone && resolvePromise(), 5000)),
            ]);
            process.exit(0);
          } catch (err) {
            log.error(`Failed to handle ${signal} gracefully. Exiting with status code 1`);
            process.exit(1);
          }
        }),
      );
    } catch (err) {
      log.error();
      log.error(`  ${chalk.red(emojis.failure)} Failure! Failed to watch project ${chalk.red(emojis.failure)}`);
      if (err.details) log.error(`  ${chalk.cyan('Details:')} ${err.details}`);
      if (err.stack) log.error(`  ${err.stack}`);
      log.error();
    }
  });

// Run
if (!process.argv.slice(2).length) program.outputHelp();
else program.parse(process.argv);
