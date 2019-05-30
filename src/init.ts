// Dependencies
import { defaults } from 'lodash';
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
import emojis from './lib/emojis';
import createLogger from './lib/createLogger';

// eslint-disable-next-line
const pkg = require('../package.json');

// Types
export interface Options {
  name: string;
  fromGitRepo?: string;
  silent: boolean;
  appDir: string;
}
export interface OptionsWithGitRepo extends Options {
  fromGitRepo: string;
}

// Init
const getOpts = (options: Partial<Options> & Pick<Options, 'name'>): Options =>
  defaults({}, options, {
    silent: false,
    appDir: process.cwd(),
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
  const log = createLogger(opts);
  const appName = opts.name;
  const newAppDir = path.resolve(opts.appDir, opts.name);
  const templatePath = path.resolve(__dirname, '..', 'template');
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
          if (fs.existsSync(newAppDir)) throw new Error(`Something already exists at ${chalk.cyan(appName)}`);
          return `${chalk.green(emojis.success)} All checks passed`;
        },
      },
      {
        title: `Cloning existing boilerplate from ${opts.fromGitRepo}`,
        enabled: () => !!opts.fromGitRepo,
        task: () =>
          exec('git', [
            'clone',
            '--quiet',
            '--origin=upstream',
            (opts as OptionsWithGitRepo).fromGitRepo,
            newAppDir,
          ]).pipe(
            catchError(() =>
              throwError(
                new Error(
                  `Failed to clone from git repo ${
                    opts.fromGitRepo
                  }. Make sure you have git (https://git-scm.com/) installed, the remote repository exists, you have the necessary permissions and internet connectivity.`,
                ),
              ),
            ),
          ),
      },
      {
        title: 'Creating project directory',
        enabled: () => !opts.fromGitRepo,
        task: () => fs.copySync(templatePath, newAppDir),
      },
      {
        title: 'Changing working directory',
        task: () => process.chdir(newAppDir),
      },
      {
        title: 'Preparing new git repository',
        enabled: () => !!opts.fromGitRepo,
        task: () =>
          exec('git', ['branch', '--unset-upstream']).pipe(
            catchError(() => throwError(new Error(`Failed to prepare git repo`))),
          ),
      },
      {
        title: 'Creating project files',
        task: () => {
          const prefix = 'v-keep-';
          return fs
            .readdirSync('./')
            .filter(f => f.startsWith('v-keep-'))
            .forEach(f => fs.renameSync(f, f.substr(prefix.length)));
        },
      },
      {
        title: 'Installing project dependencies',
        task: () => exec('npm', ['install']),
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    {
      showSubtasks: false,
      renderer: opts.silent ? 'silent' : 'default',
    } as ListrOptions,
  );

  /**
   * Create project
   */
  log.info();
  log.info(
    `  Creating new project ${chalk.cyan(appName)} using ${chalk.cyan(pkg.name)} ${chalk.cyan(
      `v${pkg.version}`,
    )} ${chalk.green(emojis.robot)}`,
  );
  log.info();
  const ctx = await tasks.run();
  log.info();
  log.info(`  ${chalk.green(emojis.rocket)} Success! ${chalk.green(emojis.rocket)}`);
  log.info(`  Project ${chalk.cyan(appName)} is now created at ${chalk.cyan(newAppDir)}`);
  log.info();
  log.info(`  To get started, run the following commands`);
  log.info(`    ${chalk.cyan(`cd ${path.relative(opts.appDir, newAppDir)}`)}`);
  log.info(`    ${chalk.cyan('npm run start:watch')}`);
  log.info();
  log.info(
    `  For more information, please refer to the ${chalk.cyan('README.md')} file or visit ${chalk.cyan(pkg.homepage)}`,
  );
  log.info();
  return ctx;
}
