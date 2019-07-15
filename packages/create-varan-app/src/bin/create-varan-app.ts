#!/usr/bin/env node
import 'source-map-support/register';
import program from 'commander';
import updateNotifier from 'update-notifier';
import chalk from 'chalk';
import path from 'path';
import createLogger from '../lib/createLogger';
import emojis from '../lib/emojis';
import init from '../lib/init';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

// Init
process.on('unhandledRejection', err => {
  throw err;
});

// Check for updates
updateNotifier({ pkg }).notify();

// Setup program
program.usage('<project name> [options]').version(pkg.version);

/**
 * Create a new project
 */
program
  .arguments('<name>')
  .option('-s, --silent', 'silence output')
  .action(async (name, opts) => {
    const log = createLogger({ silent: opts.silent });
    const cwd = process.cwd();
    try {
      log.info();
      log.info(
        `  Creating new project ${chalk.cyan(name)} using ${chalk.cyan(pkg.name)} ${chalk.cyan(
          `v${pkg.version}`,
        )} ${chalk.green(emojis.robot)}`,
      );
      log.info();
      const { appDir } = await init({
        name,
        verbose: !opts.silent,
      });

      log.info();
      log.info(`  ${chalk.green(emojis.rocket)} Success! ${chalk.green(emojis.rocket)}`);
      log.info(`  Project ${chalk.cyan(name)} is now created at ${chalk.cyan(appDir)}`);
      log.info();
      log.info(`  To get started, run the following commands`);
      log.info(`    ${chalk.cyan(`cd ${path.relative(cwd, appDir)}`)}`);
      log.info(`    ${chalk.cyan('npx varan watch')}`);
      log.info();
      log.info(
        `  For more information on how to use ${chalk.cyan(name)}, please refer to the ${chalk.cyan(
          'README.md',
        )} file or visit ${chalk.cyan(pkg.homepage)}`,
      );
      log.info();
    } catch (err) {
      log.error();
      log.error(
        `  ${chalk.red(emojis.failure)} Failure! Project ${chalk.cyan(name)} could not be created ${chalk.red(
          emojis.failure,
        )}`,
      );
      if (err.details) log.error(`  ${chalk.cyan('Details:')} ${err.details}`);
      if (err.errors) log.error(`  ${err.errors}`);
      else if (err.stack) log.error(`  ${err.stack}`);
      log.error();
    }
  });

// Run
if (!process.argv.slice(2).length) program.outputHelp();
else program.parse(process.argv);
