import defaults from 'lodash.defaults';
import execa from 'execa';
import Listr, { ListrOptions } from 'listr';
import validateProjectName from 'validate-npm-package-name';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import emojis from './emojis';

// Types
export interface Options {
  name: string;
  fromGitRepo: string;
  verbose: boolean;
  appDir: string;
}

// Init
const getOpts = (options: Partial<Options> & Pick<Options, 'name'>): Options =>
  defaults({}, options, {
    appDir: process.cwd(),
    verbose: false,
    fromGitRepo: 'https://github.com/ersims/varan-boilerplate.git',
  });

// Exports
export default async function init(options: Partial<Options> & Pick<Options, 'name'>) {
  const opts = getOpts(options);
  const appName = opts.name;
  const appDir = path.resolve(opts.appDir, opts.name);
  const taskOptions: ListrOptions & { showSubtasks: boolean } = {
    showSubtasks: true,
    renderer: opts.verbose ? 'default' : 'silent',
    nonTTYRenderer: opts.verbose ? 'verbose' : 'silent',
  };
  const tasks = new Listr(
    [
      {
        title: 'Prerequisite checks',
        task: () => {
          // Validate project name
          const projectNameValidation = validateProjectName(opts.name);
          if (!projectNameValidation.validForNewPackages) {
            const error =
              (projectNameValidation.errors && projectNameValidation.errors[0]) ||
              (projectNameValidation.warnings && projectNameValidation.warnings[0]);
            throw new Error(`Project ${error}`);
          }

          // Check if directory is available
          if (fs.existsSync(appDir)) throw new Error(`Something already exists at ${chalk.cyan(appName)}`);
          return `${chalk.green(emojis.success)} All checks passed`;
        },
      },
      {
        title: `Cloning boilerplate from ${opts.fromGitRepo}`,
        task: async () => {
          try {
            await execa('git', ['clone', '--quiet', '--origin=upstream', opts.fromGitRepo, appDir]);
          } catch (err) {
            throw new Error(
              `Failed to clone from git repo ${opts.fromGitRepo}. Make sure you have git (https://git-scm.com/) installed, the remote repository exists, you have the necessary permissions and internet connectivity.`,
            );
          }
        },
      },
      {
        title: 'Changing working directory',
        task: () => process.chdir(appDir),
      },
      {
        title: 'Preparing new git repository',
        task: async () => {
          try {
            await execa('git', ['branch', '--unset-upstream']);
          } catch (err) {
            throw new Error('Failed to prepare git repo');
          }
        },
      },
      {
        title: 'Installing project dependencies',
        task: () => execa('npm', ['install']),
      },
    ],
    taskOptions,
  );

  /**
   * Create project
   */
  const context = await tasks.run();
  return { context, tasks, appDir, appName };
}
