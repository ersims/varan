import { defaults, omit } from 'lodash';
import path from 'path';
import webpack from 'webpack';
import chalk from 'chalk';
import Listr, { ListrOptions } from 'listr';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import fs from 'fs-extra';
import fileSize from 'filesize';
import emojis from './emojis';
import getBuildStatsFromManifest, { BuildStats } from './getBuildStatsFromManifest';
import getCompilerStats, { CompilerStats } from './getCompilerStats';
import getConfigs, { ValidConfiguration } from './getConfigs';
import BuildError from './BuildError';

// Types
interface TaskContext {
  build?: TaskContextBuild;
  previousBuild?: BuildStats | null;
  currentBuild?: BuildStats | null;
  errors: string[];
  warnings: string[];
}
interface TaskContextBuild {
  stats: webpack.Stats;
  config: webpack.Configuration;
  outputPath: webpack.Output['path'];
  configFile: string;
}
interface TaskListContext {
  stats: TaskContext[];
  totals: CompilerStats;
}
export interface Options {
  configs: ValidConfiguration[];
  verbose: boolean;
  warnAssetSize: number;
  warnChunkSize: number;
  env: 'development' | 'production';
  appDir: string;
  inputFileSystem?: webpack.Compiler['inputFileSystem'];
  outputFileSystem?: webpack.Compiler['outputFileSystem'];
  [webpackKey: string]: any;
}

// Init
const getOpts = (options: Partial<Options>): Options =>
  defaults({}, options, {
    verbose: false,
    configs: [
      path.resolve(__dirname, '..', '..', 'webpack', 'server'),
      path.resolve(__dirname, '..', '..', 'webpack', 'client'),
    ],
    warnAssetSize: 512 * 1024,
    warnChunkSize: 1024 * 1024,
    env: 'production',
    appDir: process.cwd(),
    inputFileSystem: undefined,
    outputFileSystem: undefined,
  });

// Exports
export default async function build(options: Partial<Options>) {
  const opts = getOpts(options);

  // Setup
  process.env.BABEL_ENV = opts.env;
  const configs = getConfigs(opts.configs, opts);
  const multiCompiler: webpack.MultiCompiler = webpack(configs.map(c => omit(c, ['devServer'])));
  if (opts.inputFileSystem) multiCompiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) multiCompiler.outputFileSystem = opts.outputFileSystem;
  const taskOptions: ListrOptions & { showSubtasks: boolean } = {
    showSubtasks: true,
    renderer: opts.verbose ? 'default' : 'silent',
    nonTTYRenderer: opts.verbose ? 'verbose' : 'silent',
  };
  const tasks = new Listr(
    [
      {
        title: 'Build',
        task: () =>
          new Listr(
            [
              ...multiCompiler.compilers.map((compiler, i) => ({
                title: `Build ${path.resolve(
                  typeof opts.configs[i] === 'string'
                    ? opts.configs[i].toString()
                    : compiler.options.name || i.toString(),
                )}`,
                task: () =>
                  new Listr([
                    {
                      title: 'Prepare',
                      task: (ctx: TaskListContext) => {
                        if (!ctx.stats) ctx.stats = [];
                        ctx.stats[i] = {
                          errors: [],
                          warnings: [],
                        };
                        return `${chalk.green(emojis.success)} Preparations completed successfully`;
                      },
                    },
                    {
                      title: 'Measure previous build',
                      skip: () => opts.silent || compiler.options.target === 'node',
                      task: async (ctx: TaskListContext) => {
                        const statsPlugin =
                          compiler.options.plugins &&
                          (compiler.options.plugins.find(p => p instanceof StatsWriterPlugin) as StatsWriterPlugin);
                        if (statsPlugin) {
                          try {
                            const searchPath = compiler.outputPath;
                            const manifestFile = path.resolve(searchPath, statsPlugin.opts.filename);
                            const manifestRaw = await fs.readFile(manifestFile);
                            const manifest = JSON.parse(manifestRaw.toString());
                            ctx.stats[i].previousBuild = await getBuildStatsFromManifest(searchPath, manifest);
                          } catch (err) {
                            // Empty
                          }
                        }
                      },
                    },
                    {
                      title: 'Build',
                      task: (ctx: TaskListContext) =>
                        new Promise((resolve, reject) => {
                          compiler.run((err, stats) => {
                            if (err) return reject(err);

                            const info = stats.toJson();
                            ctx.stats[i].errors = info.errors;
                            ctx.stats[i].warnings = info.warnings;
                            if (stats.hasErrors() || info.errors.length > 0) {
                              const buildError = new BuildError('Build failed with errors');
                              buildError.errors = ctx.stats[i].errors;
                              buildError.warnings = ctx.stats[i].warnings;
                              return reject(buildError);
                            }

                            // Send data
                            const config = compiler.options;
                            ctx.stats[i].build = {
                              config,
                              stats,
                              configFile: path.resolve(
                                typeof opts.configs[i] === 'string'
                                  ? opts.configs[i].toString()
                                  : config.name || i.toString(),
                              ),
                              outputPath:
                                (config.output && config.output.path && path.dirname(config.output.path)) || undefined,
                            };

                            return resolve(`${chalk.green(emojis.success)} Build completed successfully!`);
                          });
                        }),
                    },
                    {
                      title: 'Measure current build',
                      skip: () => opts.silent || compiler.options.target === 'node',
                      task: async (ctx: TaskListContext) => {
                        const statsPlugin =
                          compiler.options.plugins &&
                          (compiler.options.plugins.find(p => p instanceof StatsWriterPlugin) as StatsWriterPlugin);
                        if (statsPlugin) {
                          try {
                            const searchPath = compiler.outputPath;
                            const manifestFile = path.resolve(searchPath, statsPlugin.opts.filename);
                            const manifestRaw = await fs.readFile(manifestFile);
                            const manifest = JSON.parse(manifestRaw.toString());
                            ctx.stats[i].currentBuild = await getBuildStatsFromManifest(searchPath, manifest);

                            // Check for chunk size violations
                            if (
                              ctx.stats[i].currentBuild &&
                              Object.values((ctx.stats[i].currentBuild as BuildStats).chunks).some(
                                chunk => chunk.size > opts.warnChunkSize,
                              )
                            ) {
                              ctx.stats[i].warnings.push(
                                `one or more chunks exceeds the set ${chalk.cyan(
                                  'opts.warnChunkSize',
                                )} limit of ${chalk.cyan(fileSize(opts.warnChunkSize))}.`,
                              );
                            }

                            // Check for asset size violations
                            if (
                              ctx.stats[i].currentBuild &&
                              Object.values((ctx.stats[i].currentBuild as BuildStats).assets).some(
                                asset => asset.size > opts.warnAssetSize,
                              )
                            ) {
                              ctx.stats[i].warnings.push(
                                `one or more assets exceeds the set ${chalk.cyan(
                                  'opts.warnAssetSize',
                                )} limit of ${chalk.cyan(fileSize(opts.warnAssetSize))}`,
                              );
                            }
                          } catch (err) {
                            // Empty
                          }
                        }
                      },
                    },
                  ]),
              })),
            ],
            // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
            {
              showSubtasks: true,
              concurrent: true,
            } as ListrOptions,
          ),
      },
      {
        title: 'Calculate build stats',
        task: (ctx: TaskListContext) => {
          const stats = Object.values(ctx.stats)
            .filter(s => s.build && s.build.stats)
            .map(s => (s.build as TaskContextBuild).stats);
          ctx.totals = getCompilerStats(stats);
          return `${chalk.green(emojis.success)} Build statistics calculated successfully`;
        },
      },
    ],
    taskOptions,
  );

  /**
   * Build project
   */
  return tasks.run() as Promise<TaskListContext>;
}
