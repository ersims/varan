import webpack, { Compiler, Stats } from 'webpack';
import Listr, { ListrOptions } from 'listr';
import chalk from 'chalk';
import WebpackDevServer from 'webpack-dev-server';
import { emojis } from './emojis';
import { resolveAppRelativePath } from './resolveAppRelativePath';
import { VaranConfiguration } from '../types/VaranConfiguration';
import { getWebpackConfig } from './getWebpackConfig';
import BuildError from './BuildError';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

// Types
interface WatchOptions extends VaranConfiguration {}

interface TaskListContext {
  startTime: number;
  endTime: number | null;
  tasks: {
    devServer: WebpackDevServer | null;
    config: string;
    stats: Stats | null;
    compiler: Compiler | null;
  }[];
}

// Init
const successMessage = (message: string) => `${chalk.green(emojis.success)} ${message}`;
const failureMessage = (message: string) => `${chalk.red(emojis.failure)} ${message}`;

// Exports
export const watch = async ({
  configs,
  silent,
}: WatchOptions): Promise<Pick<TaskListContext, 'startTime' | 'endTime' | 'tasks'>> => {
  // Fetch configs
  const webpackConfigs = await Promise.all(
    configs.map((config) => getWebpackConfig(config, {}, { mode: 'development' })),
  );

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
                          compiler,
                          stats: null,
                          devServer: null,
                        };
                        return successMessage('Preparations completed');
                      },
                    },
                    // {
                    //   title: 'Compile',
                    //   task: (ctx: TaskListContext) =>
                    //     new Promise((resolve, reject) => {
                    //       let hasBuiltSuccessfully = false;
                    //       compiler.run(async (err, stats) => {
                    //         if (!hasBuiltSuccessfully) {
                    //           if (err) return reject(err);
                    //           if (!stats) return reject(new Error('Invalid webpack result'));
                    //
                    //           // Store current task stats
                    //           ctx.tasks[i].stats = stats;
                    //
                    //           // Check for errors
                    //           if (stats.hasErrors()) {
                    //             const { errors, warnings } = stats.toJson({
                    //               errors: true,
                    //               warnings: true,
                    //             });
                    //             const buildError = new BuildError('Build failed with errors');
                    //             buildError.errors = errors;
                    //             buildError.warnings = warnings;
                    //             return reject(buildError);
                    //           }
                    //           hasBuiltSuccessfully = true;
                    //         }
                    //         return resolve(successMessage('Build completed'));
                    //       });
                    //     }),
                    // },
                    {
                      title: 'Start',
                      task: async (ctx: TaskListContext) => {
                        const task = ctx.tasks[i];
                        const target = task.compiler?.options.target;

                        // Target web?
                        if (!target || target === 'web') {
                          let initialBuild = true;
                          const devServerConfig = task.compiler?.options.devServer;

                          // Has DevServer?
                          if (devServerConfig) {
                            return new Promise((resolve, reject) => {
                              const devServer = new WebpackDevServer(compiler, devServerConfig);

                              // Start
                              devServer.listen(
                                devServerConfig.port || 3000,
                                devServerConfig.host || '0.0.0.0',
                                (err) => {
                                  if (err) reject(err);
                                },
                              );

                              // Store current runner
                              task.devServer = devServer;

                              compiler.hooks.done.tap(pkg.name, (stats) => {
                                if (initialBuild) {
                                  initialBuild = false;

                                  // Store current task stats
                                  task.stats = stats;

                                  resolve(successMessage('Build completed'));
                                }
                              });
                            });
                          }

                          // Compile and continue
                          return new Promise((resolve, reject) =>
                            compiler.run((err, stats) => {
                              if (err) return reject(err);
                              if (!stats) return reject(new Error('Invalid webpack result'));

                              // Store current task stats
                              task.stats = stats;

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
                          );
                        }

                        // Target node
                        return successMessage('Started successfully');
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

  // Run
  const { tasks, endTime, startTime } = await taskList.run();
  return { tasks, endTime, startTime };
};
