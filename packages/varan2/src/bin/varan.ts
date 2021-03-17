#!/usr/bin/env node
import 'source-map-support/register';
import 'dotenv/config';
import updateNotifier from 'update-notifier';
import program from 'commander';
import { build } from '../commands/build';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

// Setup
updateNotifier({ pkg }).notify();
process.on('unhandledRejection', (err) => {
  throw err;
});

// Init
program.usage('<command> [options]').version(pkg.version);

/**
 * Build application
 */
program
  .command('build')
  .option('-c, --config <config>', 'Provide a path to a varan config file, e.g. varan.config.js', 'varan.config.js')
  .action(build);

// Run program
if (!process.argv.slice(2).length) program.outputHelp();
else program.parse(process.argv);
