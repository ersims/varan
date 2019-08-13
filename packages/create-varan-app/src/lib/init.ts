import defaults from 'lodash.defaults';
import execa from 'execa';
import Listr, { ListrOptions } from 'listr';
import validateProjectName from 'validate-npm-package-name';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import tar from 'tar';
import axios from 'axios';
import emojis from './emojis';

// Types
export interface Options {
  name: string;
  example?: string;
  fromGitRepo: string;
  verbose: boolean;
  appDir: string;
}
export interface ContextWithTarballSource {
  varanSourceBranch: string;
}

// Init
const examplesRepo = 'ersims/varan';
const timeout = 30000;
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
        task: () =>
          new Listr(
            [
              {
                title: 'Validate project name',
                task: () => {
                  const projectNameValidation = validateProjectName(opts.name);
                  if (!projectNameValidation.validForNewPackages) {
                    const error =
                      (projectNameValidation.errors && projectNameValidation.errors[0]) ||
                      (projectNameValidation.warnings && projectNameValidation.warnings[0]);
                    throw new Error(`Project ${error}`);
                  }
                  return `${chalk.green(emojis.success)} Project name is valid`;
                },
              },
              {
                title: 'Ensure directory does not already exists',
                task: () => {
                  if (fs.existsSync(appDir)) throw new Error(`Something already exists at ${chalk.cyan(appName)}`);
                  return `${chalk.green(emojis.success)} Project directory is available`;
                },
              },
              {
                title: 'Fetch latest varan release from npm',
                enabled: () => !!opts.example,
                task: async (ctx: ContextWithTarballSource) => {
                  try {
                    const response = await axios.get('https://registry.npmjs.org/varan', { timeout });

                    // Use latest dist-tag as the git tag
                    ctx.varanSourceBranch = `v${response.data['dist-tags'].latest}`;
                  } catch (err) {
                    throw new Error(
                      `Failed to fetch latest varan information from npm. Make sure you have internet connectivity and access to registry.npmjs.org is not blocked.`,
                    );
                  }
                  return `${chalk.green(emojis.success)} Found latest varan release`;
                },
              },
              {
                title: 'Validate example',
                enabled: () => !!opts.example,
                task: async (ctx: ContextWithTarballSource) => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  const example = opts.example!;
                  const baseUrl = `https://github.com/${examplesRepo}/tree/${ctx.varanSourceBranch}/examples`;
                  try {
                    if (!/\w+/.test(example)) throw new Error('Invalid example name');

                    // Check if example exists
                    await axios.head(`${baseUrl}/${example}`, { timeout });
                  } catch (err) {
                    throw new Error(`Example ${example} does not exist. See ${baseUrl} for valid examples.`);
                  }
                  return `${chalk.green(emojis.success)} Example is valid`;
                },
              },
            ],
            taskOptions,
          ),
      },
      {
        title: `Cloning project from ${chalk.cyan(opts.fromGitRepo)}`,
        enabled: () => !opts.example,
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
        title: `Creating project directory ${chalk.cyan(appDir)}`,
        enabled: () => !!opts.example,
        task: async () => {
          try {
            await fs.mkdirp(appDir);
          } catch (err) {
            throw new Error(`Failed to create project directory. Make sure you have the required permissions.`);
          }
        },
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        title: `Fetching example ${chalk.cyan(opts.example!)}`,
        enabled: () => !!opts.example,
        task: async (ctx: ContextWithTarballSource, task) => {
          // Set branch name in title
          // eslint-disable-next-line no-param-reassign
          task.title = `${task.title} (${chalk.cyan(ctx.varanSourceBranch)})`;

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const example = opts.example!;
          try {
            // Fetch example source code
            const sourceTarballResponse = await axios.get(
              `https://codeload.github.com/${examplesRepo}/tar.gz/${ctx.varanSourceBranch}`,
              { timeout, responseType: 'stream' },
            );
            const dispositionMatches = sourceTarballResponse.data.headers['content-disposition'].match(
              /filename=(.+)\.tar\.gz/i,
            );
            const fileName = dispositionMatches[1];

            // Extract the example source code
            const extractExampleSourceCode = tar.extract(
              {
                strip: 3,
                cwd: appName,
                strict: true,
              },
              [`examples/${example}`].map(f => `${fileName}/${f}`),
            );
            sourceTarballResponse.data.pipe(extractExampleSourceCode);

            // Extract useful project files
            const extractProjectFiles = tar.extract(
              {
                strip: 1,
                cwd: appName,
                strict: true,
              },
              ['editorconfig', '.gitignore'].map(f => `${fileName}/${f}`),
            );
            sourceTarballResponse.data.pipe(extractProjectFiles);

            await Promise.all([extractExampleSourceCode, extractProjectFiles]);
          } catch (err) {
            throw new Error(
              `Failed to fetch example ${example}. Ensure that the example exists, you have internet connectivity and access to github.com is not blocked.`,
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
        enabled: () => !opts.example,
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
