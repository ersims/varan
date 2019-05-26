// Dependencies
import { defaults, omit } from 'lodash';
import path from 'path';
import webpack from 'webpack';
import chalk from 'chalk';
import Listr, { ListrOptions } from 'listr';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import fs from 'fs-extra';
import { getBorderCharacters, table } from 'table';
import fileSize from 'filesize';
import getBuildStatsFromManifest, { BuildStats } from './lib/getBuildStatsFromManifest';
import getCompilerStats, { CompilerStats } from './lib/getCompilerStats';
import emojis from './lib/emojis';
import getConfigs, { ValidConfiguration } from './lib/getConfigs';
import createLogger from './lib/createLogger';
import BuildError from './lib/BuildError';

// eslint-disable-next-line
const pkg = require('../package.json');

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
  warnAssetSize: number;
  warnChunkSize: number;
  silent: boolean;
  env: 'development' | 'production';
  appDir: string;
  inputFileSystem?: webpack.Compiler['inputFileSystem'];
  outputFileSystem?: webpack.Compiler['outputFileSystem'];
  [webpackKey: string]: any;
}

// Init
const getOpts = (options: Partial<Options>): Options =>
  defaults({}, options, {
    configs: [path.resolve(__dirname, '..', 'webpack', 'server'), path.resolve(__dirname, '..', 'webpack', 'client')],
    warnAssetSize: 512 * 1024,
    warnChunkSize: 1024 * 1024,
    silent: false,
    env: 'production',
    appDir: process.cwd(),
    inputFileSystem: undefined,
    outputFileSystem: undefined,
  });

// Exports
export default async function build(options: Partial<Options>) {
  const opts = getOpts(options);
  const log = createLogger(opts);

  // Setup
  process.env.BABEL_ENV = opts.env;
  const configs = getConfigs(opts.configs, opts);
  const multiCompiler: webpack.MultiCompiler = webpack(configs.map(c => omit(c, ['serve'])));
  if (opts.inputFileSystem) multiCompiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) multiCompiler.outputFileSystem = opts.outputFileSystem;

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
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    {
      showSubtasks: true,
      renderer: opts.silent ? 'silent' : 'default',
    } as ListrOptions,
  );

  /**
   * Build project
   */
  log.info();
  log.info(
    `  Building ${chalk.cyan(multiCompiler.compilers.length.toString())} configs for ${chalk.cyan(
      opts.env,
    )} using ${chalk.cyan(pkg.name)} ${chalk.cyan(`v${pkg.version}`)} ${chalk.green(emojis.robot)}`,
  );
  log.info();
  const result: TaskListContext = await tasks.run();
  const hasWarnings = result.stats.some(s => s.warnings.length > 0);

  // Fetch statistics
  log.info();
  log.info(
    `  ${chalk.green(emojis.rocket)} Success! ${
      hasWarnings ? `${chalk.yellow('With warnings. See below for more information!')} ` : ''
    }${chalk.green(emojis.rocket)}`,
  );
  log.info(
    `  Compiled ${chalk.cyan(result.totals.numberOfConfigs.toString())} configs for ${chalk.cyan(
      opts.env,
    )} in ${chalk.cyan(`${result.totals.timings.duration}ms`)}`,
  );
  log.info();

  // Create beautiful presentation of build statistics
  result.stats.forEach((stat, i) => {
    if (stat.build) {
      // Padding
      if (i > 0) {
        log.info();
        log.info();
      }

      const tableTotals = [
        [
          `Config file (${chalk.cyan((i + 1).toString())}/${chalk.cyan(result.totals.numberOfConfigs.toString())})`,
          chalk.cyan(stat.build.configFile),
        ],
        ['Target directory', chalk.cyan(stat.build.outputPath || '-')],
        ['Duration', chalk.cyan(`${result.totals.timings.perCompiler[i].duration.toString()}ms`)],
      ];
      log.info(
        table(tableTotals, {
          border: getBorderCharacters(`void`),
          columns: {
            0: {
              paddingLeft: 2,
              width: 25,
            },
          },
          drawHorizontalLine: () => false,
        }),
      );

      // Log assets
      if (stat.currentBuild) {
        const isChunk = (
          assetOrChunk: BuildStats['chunks'][0] | BuildStats['assets'][0],
        ): assetOrChunk is BuildStats['chunks'][0] => {
          return !!assetOrChunk.assets;
        };
        const tableHeaders = ['Asset [chunk]', 'Size', 'Gzipped', 'Brotli'];
        const printRelativeSize = (
          key: string,
          current: { name: string; [key: string]: any },
          comparisonObject?: { [key: string]: typeof current },
          warnSize?: number,
        ): null | string => {
          if (!current[key]) return null;
          let out = fileSize(current[key] as number);
          if (warnSize && current[key] > warnSize) out = chalk.red(out);
          if (comparisonObject && comparisonObject[current.name]) {
            const previous = comparisonObject[current.name] as typeof current;
            if (previous[key]) {
              if (current[key] > previous[key]) out += `  + ${chalk.red(fileSize(current[key] - previous[key]))}`;
              else if (current[key] === previous[key])
                out += `  + ${chalk.yellow(fileSize(current[key] - previous[key]))}`;
              else out += `  - ${chalk.green(fileSize(previous[key] - current[key]))}`;
            }
          }
          return out;
        };
        const printSize = (key: string, current: { name: string; [key: string]: any }, chunk = false) =>
          printRelativeSize(
            key,
            current,
            (stat.previousBuild && stat.previousBuild[chunk ? 'chunks' : 'assets']) || undefined,
            chunk ? opts.warnChunkSize : opts.warnAssetSize,
          );
        const tableRows = [
          ...Object.values(stat.currentBuild.chunks),
          ...Object.values(stat.currentBuild.assets).filter(asset => Object.keys(asset.chunks).length === 0),
        ]
          .sort((a, b) => b.size - a.size)
          .reduce<(string | number | null | undefined)[][]>((acc, cur) => {
            if (isChunk(cur)) {
              const chunkTooBig = opts.warnChunkSize && cur.size > opts.warnChunkSize;
              const name = chunkTooBig ? chalk.red(`[${cur.name}]`) : `[${cur.name}]`;
              acc.push([
                name,
                printSize('size', cur, true),
                printSize('gzip', cur, true),
                printSize('brotli', cur, true),
              ]);
              Object.values(cur.assets)
                .sort((a, b) => b.size - a.size)
                .forEach(asset => {
                  let assetName;
                  if (opts.warnAssetSize && asset.size > opts.warnAssetSize) assetName = chalk.red(asset.name);
                  else if (chunkTooBig) assetName = chalk.yellow(asset.name);
                  else assetName = asset.name;
                  acc.push([
                    `  ${assetName}${Object.keys(asset.chunks).length > 1 ? ' +' : ''}`,
                    printSize('size', asset),
                    printSize('gzip', asset),
                    printSize('brotli', asset),
                  ]);
                });
            } else {
              const name = opts.warnAssetSize && cur.size > opts.warnAssetSize ? chalk.red(cur.name) : cur.name;
              acc.push([name, printSize('size', cur), printSize('gzip', cur), printSize('brotli', cur)]);
            }
            return acc;
          }, []);
        const previousBuildSum =
          stat.previousBuild &&
          Object.values(stat.previousBuild.assets)
            .filter(asset => !!((stat.currentBuild && stat.currentBuild.assets[asset.name]) || false))
            .reduce<{ sum: { name: string; [type: string]: number | string } }>(
              (acc, cur) => {
                ['size', 'gzip', 'brotli'].forEach(k => {
                  if (cur[k])
                    acc.sum[k] = acc.sum[k] ? ((acc.sum[k] as number) += cur[k] as number) : (cur[k] as number);
                });
                return acc;
              },
              { sum: { name: 'sum' } },
            );
        const currentBuildSum = Object.values(stat.currentBuild.assets).reduce<{
          name: string;
          [type: string]: number | string;
        }>(
          (acc, cur) => {
            ['size', 'gzip', 'brotli'].forEach(k => {
              if (cur[k]) acc[k] = acc[k] ? ((acc[k] as number) += cur[k] as number) : (cur[k] as number);
            });
            return acc;
          },
          { name: 'sum' },
        );
        const tableSumRow = [
          'SUM',
          printRelativeSize('size', currentBuildSum, previousBuildSum || undefined),
          printRelativeSize('gzip', currentBuildSum, previousBuildSum || undefined),
          printRelativeSize('brotli', currentBuildSum, previousBuildSum || undefined),
        ].map(c => chalk.bold(c || ''));
        const tableBuildStats = [tableHeaders, ...tableRows, tableSumRow];

        // Show table
        log.info(
          table(tableBuildStats, {
            drawHorizontalLine: (index, size) => index === 0 || index === 1 || index === size - 1 || index === size,
          }),
        );
      }

      // Log warnings
      if (stat.warnings.length > 0) {
        log.warn(`  ${chalk.yellow(`${emojis.warning} Warnings`)}`);
        stat.warnings.forEach(warning => log.warn(`   ${chalk.yellow(emojis.smallSquare)} ${warning}`));
      }

      // Log errors
      if (stat.errors.length > 0) {
        log.error(`  ${chalk.red(`${emojis.failure} Errors`)}`);
        stat.errors.forEach(error => log.error(`   ${chalk.red(emojis.smallSquare)} ${error}`));
      }
    }
  });

  return result;
}
