import webpack, { Compiler, Configuration, Stats } from 'webpack';
import Listr, { ListrOptions } from 'listr';
import chalk from 'chalk';
import WebpackDevServer from 'webpack-dev-server';
import { resolve } from 'path';
import { emojis } from './emojis';
import { resolveAppRelativePath } from './resolveAppRelativePath';
import { VaranConfiguration } from '../types/VaranConfiguration';
import { getWebpackConfig } from './getWebpackConfig';
import BuildError from './BuildError';
import { runServer, ServerChildProcessManager } from './runServer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

// Types
interface WatchOptions extends VaranConfiguration {}

interface TaskListContext {
  startTime: number;
  endTime: number | null;
  tasks: {
    devServer: WebpackDevServer | null;
    server: ServerChildProcessManager | null;
    watcher: webpack.Watching | null;
    config: string;
    stats: Stats | null;
    compiler: Compiler | null;
  }[];
}

// Init
const successMessage = (message: string) => `${chalk.green(emojis.success)} ${message}`;
const failureMessage = (message: string) => `${chalk.red(emojis.failure)} ${message}`;
const isNodeTarget = (target: webpack.Configuration['target']) => {
  const pattern = /^node\d{0,2}(\.\d{2})?$/;
  return typeof target === 'string' && target.match(pattern);
};
const isWebTarget = (target: webpack.Configuration['target']) => {
  const pattern = /^(browserslist|web)$/;
  return !target || (typeof target === 'string' && target.match(pattern));
};

// Exports
export const watch = async ({
  configs,
  silent,
}: WatchOptions): Promise<Pick<TaskListContext, 'startTime' | 'endTime' | 'tasks'>> => {
  // Fetch configs
  const webpackConfigs = (
    await Promise.all(configs.map((config) => getWebpackConfig(config, {}, { mode: 'development' })).flat(1))
  ).flat(1);

  // Prepare webpack
  // const compilers = webpackConfigs.map((config) => webpack(config));
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
                          server: null,
                          watcher: null,
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
                      title: 'Compile',
                      skip: (ctx: TaskListContext) => !isNodeTarget(ctx.tasks[i].compiler?.options.target),
                      task: async (ctx: TaskListContext) => {
                        const task = ctx.tasks[i];
                        let initialBuild = true;
                        return new Promise((taskResolve, reject) => {
                          compiler.hooks.done.tap(pkg.name, (stats) => {
                            if (initialBuild) {
                              initialBuild = false;

                              // Store current task stats
                              task.stats = stats;

                              taskResolve(successMessage('Build completed'));
                            }
                          });

                          // Watch
                          task.watcher = compiler.watch({}, (err, stats) => {
                            if (err) return reject(err);

                            // Store current task stats
                            task.stats = stats || null;

                            // Check for errors
                            if (stats?.hasErrors()) {
                              const { errors, warnings } = stats.toJson({
                                errors: true,
                                warnings: true,
                              });
                              const buildError = new BuildError('Build failed with errors');
                              buildError.errors = errors;
                              buildError.warnings = warnings;
                              // TODO: Enable?
                              // return reject(buildError);
                            }
                          });
                        });
                      },
                    },
                    {
                      title: 'Start',
                      // Only web and node supported for now
                      skip: (ctx: TaskListContext) =>
                        !isWebTarget(ctx.tasks[i].compiler?.options.target) &&
                        !isNodeTarget(ctx.tasks[i].compiler?.options.target),
                      task: async (ctx: TaskListContext) => {
                        const target = ctx.tasks[i].compiler?.options.target;
                        const task = ctx.tasks[i];

                        // Target web?
                        if (isWebTarget(target)) {
                          let initialBuild = true;
                          const devServerConfig = task.compiler?.options.devServer;

                          // Has DevServer?
                          if (devServerConfig) {
                            return new Promise((taskResolve, reject) => {
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

                                  taskResolve(successMessage('Started successfully'));
                                }
                              });
                            });
                          }

                          // Compile and continue
                          return new Promise((taskResolve, reject) =>
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
                                // TODO: Enable?
                                // return reject(buildError);
                              }
                              return taskResolve(successMessage('Started successfully'));
                            }),
                          );
                        }

                        // Target must be node - or else it should have been skipped
                        task.server = runServer(resolve(compiler.outputPath, 'main.js'), ['--inspect']);
                        return null;
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
