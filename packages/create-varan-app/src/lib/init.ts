import defaults from 'lodash.defaults';
import execa from 'execa';
import split from 'split';
import Listr, { ListrOptions } from 'listr';
import validateProjectName from 'validate-npm-package-name';
import { merge, throwError } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import streamToObservable from '@samverschueren/stream-to-observable';
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
const exec = (cmd: string, args: string[]) => {
  const cp = execa(cmd, args);
  return merge(
    ...([
      cp.stdout && streamToObservable(cp.stdout.pipe(split()), { await: cp }),
      cp.stderr && streamToObservable(cp.stderr.pipe(split()), { await: cp }),
    ].filter(Boolean) as ReturnType<typeof streamToObservable>[]),
  ).pipe(filter(Boolean));
};

// Exports
export default async function init(options: Partial<Options> & Pick<Options, 'name'>) {
  const opts = getOpts(options);
  const appName = opts.name;
  const appDir = path.resolve(opts.appDir, opts.name);
  const taskOptions: ListrOptions & { showSubtasks: boolean } = {
    showSubtasks: false,
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
            throw new Error(`Project ${projectNameValidation.errors[0]}`);
          }

          // Check if directory is available
          if (fs.existsSync(appDir)) throw new Error(`Something already exists at ${chalk.cyan(appName)}`);
          return `${chalk.green(emojis.success)} All checks passed`;
        },
      },
      {
        title: `Cloning boilerplate from ${opts.fromGitRepo}`,
        task: () =>
          exec('git', ['clone', '--quiet', '--origin=upstream', opts.fromGitRepo, appDir]).pipe(
            catchError(() =>
              throwError(
                new Error(
                  `Failed to clone from git repo ${opts.fromGitRepo}. Make sure you have git (https://git-scm.com/) installed, the remote repository exists, you have the necessary permissions and internet connectivity.`,
                ),
              ),
            ),
          ),
      },
      {
        title: 'Changing working directory',
        task: () => process.chdir(appDir),
      },
      {
        title: 'Preparing new git repository',
        task: () =>
          exec('git', ['branch', '--unset-upstream']).pipe(
            catchError(() => throwError(new Error(`Failed to prepare git repo`))),
          ),
      },
      {
        title: 'Installing project dependencies',
        task: () => exec('npm', ['install']),
      },
    ],
    taskOptions,
  );

  /**
   * Create project
   */
  const ctx = await tasks.run();
  return { ctx, appDir, appName };
}
