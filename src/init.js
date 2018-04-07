// Dependencies
const defaults = require('lodash.defaults');
const validateProjectName = require('validate-npm-package-name');
const shell = require('shelljs');
const path = require('path');
const spawn = require('react-dev-utils/crossSpawn');
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter');
const logger = require('./lib/logger');
const pkg = require('../package.json');

// Init
const getOpts = (options) => defaults({}, options, {
  name: undefined,
  template: 'basic',
  silent: false,
  cwd: process.cwd(),
});

// Exports
module.exports = async (options) => {
  const opts = getOpts(options);
  const log = logger(opts);
  const appName = opts.name;
  const appPath = path.resolve(opts.cwd, opts.name);
  const templatePath = path.resolve(__dirname, '../examples', opts.template);
  const printErrors = (...errorMsgs) => {
    console.error();
    console.error(`Could not create project with name "${appName}":`);
    errorMsgs.reduce((acc, cur) => acc.concat(cur), []).forEach(errorMsg => errorMsg && console.error(`  • ${errorMsg}`));
    process.exit(1);
  };

  // Validate project name
  const projectNameValidation = validateProjectName(appName);
  if (!projectNameValidation.validForNewPackages) printErrors((projectNameValidation.errors || []).concat(projectNameValidation.warnings));

  // Check if directory name is available
  if (shell.test('-e', appPath)) printErrors(`Something already exists at "${appPath}"`);

  // Validate template
  if (!/^([a-z0-9-_])+$/i.test(opts.template) || !shell.test('-d', templatePath)) printErrors(`Unknown project template "${opts.template}"`);

  /**
   * Create project
   */
  log();
  log(`Creating ${pkg.name} project ${appName} at ${appPath}`);
  log();

  log('  1. Creating project directory');
  shell.cp('-R', templatePath, appPath);

  log('  2. Changing working directory');
  process.chdir(appPath);

  log('  3. Installing project dependencies');
  const procDeps = spawn.sync('npm', ['install', '--silent'], { stdio: 'inherit' });
  if (procDeps.status !== 0) printErrors(`Failed to install project dependencies`);
  const procVaran = spawn.sync('npm', ['install', '--silent', '--save', 'varan@latest'], { stdio: 'inherit' });
  if (procVaran.status !== 0) printErrors(`Failed to install latest version of "varan"`);

  log(`  4. Success! Project ${appName} is now created at ${appPath}`);
  log(`     The following commands can be used inside your newly created project`);
  log(`       npm run watch`);
  log(`         Starts the development version of the project. Hot reloading is automatically enabled`);
  log(`       npm run build`);
  log(`         Build a production ready version of your project`);
  log(`       npm run start`);
  log(`         Run the production build you built using the previous command`);
  log();
  log(`     To get started, run the following commands`);
  log(`       cd ${appPath}`);
  log(`       npm run watch`);
  log()
};
