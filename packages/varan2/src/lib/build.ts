import webpack, { Stats } from 'webpack';
import Listr, { ListrOptions } from 'listr';
import chalk from 'chalk';
import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { getWebpackConfig } from './getWebpackConfig';
import { emojis } from './emojis';
import { VaranConfiguration } from '../types/VaranConfiguration';
import BuildError from './BuildError';
import { resolveAppRelativePath } from './resolveAppRelativePath';
import { VaranAssetManifest } from '../types/VaranAssetManifest';

// Types
interface BuildOptions extends VaranConfiguration {}

interface TaskListContext {
  startTime: number;
  endTime: number | null;
  tasks: {
    // Manifest from previous build (for comparison)
    lastManifest: VaranAssetManifest | null;
    // Current manifest
    currentManifest: VaranAssetManifest | null;
    config: string;
    stats: Stats | null;
  }[];
}

// Init
const manifestFileName = 'varan.manifest.json';
const readFileAsync = promisify(readFile);
const successMessage = (message: string) => `${chalk.green(emojis.success)} ${message}`;
const failureMessage = (message: string) => `${chalk.red(emojis.failure)} ${message}`;

// Exports
export const build = async ({
  configs,
  silent,
}: BuildOptions): Promise<Pick<TaskListContext, 'startTime' | 'endTime' | 'tasks'>> => {
  // Fetch configs
  const webpackConfigs = await Promise.all(configs.map(getWebpackConfig));

  // Prepare webpack
  const multiCompiler = webpack(webpackConfigs);

  // Create build pipeline
  const taskOptions: ListrOptions = {
    renderer: silent ? 'silent' : 'default',
    nonTTYRenderer: silent ? 'silent' : 'verbose',
  };
  const taskList = new Listr(
    [
      {
        title: 'Prepare',
        task: (ctx: TaskListContext) => {
          // eslint-disable-next-line no-param-reassign
          ctx.startTime = Date.now();
          ctx.endTime = null;
          ctx.tasks = [];
          successMessage('Preparations completed');
        },
      },
      {
        title: 'Build',
        task: () =>
          new Listr(
            multiCompiler.compilers.map((compiler, i) => {
              const config =
                typeof configs[i] === 'string'
                  ? resolveAppRelativePath(configs[i])
                  : webpackConfigs[i].name || compiler.options.name || `config #${i + 1}`;
              return {
                title: `Building ${config}`,
                task: () =>
                  new Listr([
                    {
                      title: 'Prepare',
                      task: async (ctx: TaskListContext) => {
                        ctx.tasks[i] = {
                          config,
                          stats: null,
                          currentManifest: null,
                          lastManifest: null,
                        };

                        // Check for previous manifest to compare against
                        try {
                          const outputPath = compiler.options.output.path || resolveAppRelativePath('dist');
                          ctx.tasks[i].lastManifest = JSON.parse(
                            await readFileAsync(path.resolve(outputPath, manifestFileName), 'utf-8'),
                          );
                        } catch (err) {
                          /* swallow error */
                        }
                        return successMessage('Preparations completed');
                      },
                    },
                    {
                      title: 'Compile',
                      task: (ctx: TaskListContext) =>
                        new Promise((resolve, reject) =>
                          compiler.run(async (err, stats) => {
                            if (err) return reject(err);
                            if (!stats) return reject(new Error('Invalid webpack result'));

                            // Store current task stats
                            ctx.tasks[i].stats = stats;

                            // Check for errors
                            if (stats.hasErrors()) {
                              const { errors, warnings } = stats.toJson({
                                errors: true,
                                warnings: true,
                              });
                              const buildError = new BuildError('Build failed with errors');
                              buildError.errors = errors;
                              buildError.warnings = warnings;
                              return reject(buildError);
                            }
                            return resolve(successMessage('Build completed'));
                          }),
                        ),
                    },
                    {
                      title: 'Measure',
                      task: async (ctx: TaskListContext) => {
                        // Try to load the asset manifest
                        const isVaranAssetManifest = (MaybeManifest: any): MaybeManifest is VaranAssetManifest => true;
                        const manifest = ctx.tasks[i].stats?.compilation.getAsset(manifestFileName)?.name;
                        if (!manifest || !isVaranAssetManifest(manifest)) {
                          return failureMessage('Manifest could not be created');
                        }

                        // Load manifest
                        try {
                          const outputPath = compiler.options.output.path || resolveAppRelativePath('dist');
                          ctx.tasks[i].currentManifest = JSON.parse(
                            await readFileAsync(path.resolve(outputPath, manifestFileName), 'utf-8'),
                          );
                          return successMessage('Manifest created');
                        } catch (err) {
                          return failureMessage('Failed to load manifest file');
                        }
                      },
                    },
                  ]),
              };
            }),
            { concurrent: true },
          ),
      },
      {
        title: 'Measure',
        task: (ctx: TaskListContext) => {
          ctx.endTime = Date.now();
          return successMessage('Measurement completed');
        },
      },
    ],
    taskOptions,
  );
  const { tasks, endTime, startTime } = await taskList.run();
  return { tasks, endTime, startTime };
};
