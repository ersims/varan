// Dependencies
const defaults = require('lodash.defaults');
const validateProjectName = require('validate-npm-package-name');
const path = require('path');
const fs = require('fs-extra');
const spawn = require('react-dev-utils/crossSpawn');
const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = require('react-dev-utils/FileSizeReporter');
const logger = require('./lib/logger');
const pkg = require('../package.json');

// Init
const getOpts = options =>
  defaults({}, options, {
    name: undefined,
    fromGitRepo: null,
    silent: false,
    cwd: process.cwd(),
  });

// Exports
module.exports = async options => {
  const opts = getOpts(options);
  const log = logger(opts);
  const appName = opts.name;
  const appPath = path.resolve(opts.cwd, opts.name);
  const templatePath = path.resolve(__dirname, '..', 'template');
  const printErrors = (...errorMsgs) => {
    console.error();
    console.error(`Could not create project with name "${appName}":`);
    errorMsgs
      .reduce((acc, cur) => acc.concat(cur), [])
      .forEach(errorMsg => errorMsg && console.error(`  • ${errorMsg}`));
    process.exit(1);
  };

  // Validate project name
  const projectNameValidation = validateProjectName(appName);
  if (!projectNameValidation.validForNewPackages)
    printErrors((projectNameValidation.errors || []).concat(projectNameValidation.warnings));

  // Check if directory name is available
  if (fs.existsSync(appPath)) printErrors(`Something already exists at "${appPath}"`);

  /**
   * Create project
   */
  log();
  log(`Creating ${pkg.name} project ${appName} at ${appPath}`);
  log();

  // Use advanced boilerplate?
  if (opts.fromGitRepo) {
    log(` 🛴 1. Cloning existing boilerplate from ${opts.fromGitRepo}`);
    const procGit = spawn.sync(
      'git',
      ['clone', '--quiet', '--depth=1', '--origin=upstream', opts.fromGitRepo, appPath],
      {
        stdio: 'inherit',
      },
    );
    if (procGit.status !== 0)
      printErrors(
        `Failed to clone from git repo ${
          opts.fromGitRepo
        }. Make sure you have git (https://git-scm.com/) installed, the remote repository exists, you have the necessary permissions and internet connectivity.`,
      );
  } else {
    log(' 🛴 1. Creating project directory');
    fs.copySync(templatePath, appPath);
  }

  log(' 🚲 2. Changing working directory');
  process.chdir(appPath);

  log(' 🚜 3. Creating useful project files');
  const prefix = 'v-keep-';
  fs.readdirSync('./')
    .filter(f => f.startsWith('v-keep-'))
    .forEach(f => fs.renameSync(f, f.substr(prefix.length)));

  log(' 🚗 4. Installing project dependencies');
  const procDeps = spawn.sync('npm', ['install', '--silent', '--quiet', '--loglevel=silent'], {
    stdio: 'inherit',
  });
  if (procDeps.status !== 0) printErrors(`Failed to install project dependencies`);

  log(` 🚀 5. Success! Project ${appName} is now created at ${appPath}`);
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
  log();
};
