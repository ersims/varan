#!/usr/bin/env node

// Dependencies
const program = require('commander');
const pkg = require('./package.json');

// Setup program
program
  .version(pkg.version);
program
  .command('build')
  .action(() => require('./scripts/build')());
program
  .command('watch')
  .allowUnknownOption()
  .action(() => require('./scripts/watch')());

// Run
if (!process.argv.slice(2).length) program.outputHelp();
else program.parse(process.argv);
