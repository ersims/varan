// Dependencies
const defaults = require('lodash.defaults');
const validateProjectName = require('validate-npm-package-name');
const path = require('path');
const fs = require('fs-extra');
const Listr = require('listr');
const SilentRenderer = require('listr-silent-renderer');
const execa = require('execa');
const split = require('split');
const { merge, throwError } = require('rxjs');
const { catchError, filter } = require('rxjs/operators');
const streamToObservable = require('@samverschueren/stream-to-observable');
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
const exec = (cmd, args) => {
  const cp = execa(cmd, args);
  return merge(
    streamToObservable(cp.stdout.pipe(split()), { await: cp }),
    streamToObservable(cp.stderr.pipe(split()), { await: cp }),
  ).pipe(filter(Boolean));
};

// Exports
module.exports = async options => {
  const opts = getOpts(options);
  const log = logger(opts);
  const appName = opts.name;
  const appPath = path.resolve(opts.cwd, opts.name);
  const templatePath = path.resolve(__dirname, '..', 'template');
  const tasks = new Listr(
    [
      {
        title: 'Prerequisite check',
        task: () => {
          // Validate project name
          const projectNameValidation = validateProjectName(appName);
          if (!projectNameValidation.validForNewPackages)
            throw new Error((projectNameValidation.errors || []).concat(projectNameValidation.warnings).join('\n'));

          // Check if directory name is available
          if (fs.existsSync(appPath)) throw new Error(`Something already exists at "${appPath}"`);
          return true;
        },
      },
      {
        title: `Cloning existing boilerplate from ${opts.fromGitRepo}`,
        enabled: () => opts.fromGitRepo,
        task: () =>
          exec('git', ['clone', '--quiet', '--depth=1', '--origin=upstream', opts.fromGitRepo, appPath]).pipe(
            catchError(err => {
              throwError(
                new Error(
                  `Failed to clone from git repo ${
                    opts.fromGitRepo
                  }. Make sure you have git (https://git-scm.com/) installed, the remote repository exists, you have the necessary permissions and internet connectivity.`,
                ),
              );
            }),
          ),
      },
      {
        title: `Creating project directory`,
        enabled: () => !opts.fromGitRepo,
        task: () => fs.copySync(templatePath, appPath),
      },
      {
        title: `Changing working directory`,
        task: () => process.chdir(appPath),
      },
      {
        title: `Creating project files`,
        task: () => {
          const prefix = 'v-keep-';
          return fs
            .readdirSync('./')
            .filter(f => f.startsWith('v-keep-'))
            .forEach(f => fs.renameSync(f, f.substr(prefix.length)));
        },
      },
      {
        title: `Installing project dependencies`,
        task: () => exec('npm', ['install']),
      },
    ],
    {
      showSubtasks: false,
      renderer: opts.silent && SilentRenderer,
    },
  );

  /**
   * Create project
   */
  log();
  log(`Creating ${pkg.name} project ${appName} at ${appPath}`);
  log();

  return tasks
    .run()
    .then(() => {
      log();
      log();
      log(` 🚀 Success! Project ${appName} is now created at ${appPath}`);
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
    })
    .catch(err => {
      console.error();
      console.error();
      console.error(` 💥 Failure! Project ${appName} could not be created at ${appPath}.`);
      console.error();
      console.error();
    });
};
