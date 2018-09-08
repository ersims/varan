// Dependencies
const defaults = require('lodash.defaults');
const webpack = require('webpack');
const path = require('path');
const Listr = require('listr');
const SilentRenderer = require('listr-silent-renderer');
const omit = require('lodash.omit');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const { table } = require('table');
const fileSize = require('filesize');
const chalk = require('chalk');
const figures = require('figures');
const logger = require('./lib/logger');
const getConfigs = require('./lib/getConfigs');
const getCompilationStats = require('./lib/getCompilationStats');
const getBuildStats = require('./lib/getBuildStats');

// Init
const getOpts = options =>
  defaults({}, options, {
    configs: ['../webpack/client.js', '../webpack/server.js'].map(configFile => path.resolve(__dirname, configFile)),
    warnBundleSize: 512 * 1024,
    warnChunkSize: 1024 * 1024,
    silent: false,
    env: 'production',
    inputFileSystem: undefined,
    outputFileSystem: undefined,
  });

// Exports
module.exports = async options => {
  const opts = getOpts(options);
  const log = logger(opts);
  process.env.BABEL_ENV = opts.env;

  // Load configs
  const configs = getConfigs(opts.configs, opts);

  // Prepare webpack compiler
  const compiler = webpack(configs.map(c => omit(c, ['serve'])));
  if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

  // Prepare build tasks
  const tasks = new Listr(
    [
      {
        title: 'Build',
        task: () => {
          return new Listr(
            compiler.compilers.map((c, i) => ({
              title: `Build ${path.resolve(typeof opts.configs[i] === 'string' ? opts.configs[i] : config.name || i)}`,
              task: () =>
                new Listr([
                  {
                    title: 'Prerequisites',
                    task: ctx => {
                      if (!ctx.stats) ctx.stats = {};
                      ctx.stats[i] = {};
                      return true;
                    },
                  },
                  {
                    title: 'Measure previous build',
                    skip: () => opts.silent,
                    task: ctx => {
                      const statsPlugin = c.options.plugins.find(p => p instanceof StatsWriterPlugin);
                      if (statsPlugin) ctx.stats[i].statsManifest = statsPlugin.opts.filename;
                      ctx.stats[i].previousFileStats = ctx.stats[i].statsManifest
                        ? getBuildStats(c.outputPath, ctx.stats[i].statsManifest)
                        : {};
                      return true;
                    },
                  },
                  {
                    title: 'Build',
                    task: ctx =>
                      new Promise((resolve, reject) => {
                        c.run((err, stats) => {
                          if (err) {
                            console.error(err.stack || err);
                            if (err.details) console.error(err.details);
                            return reject(err);
                          }

                          const info = stats.toJson();
                          if (stats.hasErrors()) {
                            console.error(info.errors.map(e => e.split('\n')));
                            const error = new Error('Build failed');
                            error.details = info.errors;
                            return reject(error);
                          }
                          if (stats.hasWarnings() && info.warnings.length > 0) {
                            console.warn(`${chalk.redBright(figures.warning)} Build has warnings:`);
                            info.warnings.forEach(warning => console.warn(warning));
                          }
                          const compilerStats = getCompilationStats(stats);
                          const config = c.options;
                          ctx.stats[i].build = {
                            stats,
                            configFile: path.resolve(
                              typeof opts.configs[i] === 'string' ? opts.configs[i] : config.name || i,
                            ),
                            outputPath: path.dirname(config.output.path),
                            duration: compilerStats.timings.total.duration,
                            options: c.options,
                          };
                          resolve(stats);
                        });
                      }),
                  },
                  {
                    title: 'Measure build stats',
                    skip: () => opts.silent,
                    task: ctx => {
                      ctx.stats[i].newFileStats = ctx.stats[i].statsManifest
                        ? getBuildStats(c.outputPath, ctx.stats[i].statsManifest)
                        : {};
                      return true;
                    },
                  },
                ]),
            })),
            { showSubtasks: true, concurrent: true },
          );
        },
      },
      {
        title: 'Calculate build stats',
        skip: () => opts.silent,
        task: ctx => {
          const getDiff = (newSize, prevSize) => {
            if (newSize === prevSize) return chalk.yellow(`+${fileSize(newSize - prevSize)}`);
            return newSize > prevSize
              ? chalk.red(`+${fileSize(newSize - prevSize)}`)
              : chalk.green(`-${fileSize(prevSize - newSize)}`);
          };
          const colorize = (size, text) => {
            return size > opts.warnChunkSize ? chalk.redBright(text) : text;
          };
          Object.values(ctx.stats).forEach(stats => {
            const sumRow = [chalk.bold('SUM'), null, null, null];
            stats.table = [['Asset', 'Size', 'Gzipped', 'Brotli']];
            Object.entries(stats.newFileStats)
              .sort(([af, ad], [bf, bd]) => bd.size - ad.size)
              .forEach(([file, data]) => {
                if (data.size) sumRow[1] = sumRow[1] ? sumRow[1] + data.size : data.size;
                if (data.gzip) sumRow[2] = sumRow[2] ? sumRow[2] + data.gzip : data.gzip;
                if (data.brotli) sumRow[3] = sumRow[3] ? sumRow[3] + data.brotli : data.brotli;
                if (data.size > opts.warnChunkSize && (!stats.warnChunkSize || data.size > stats.warnChunkSize))
                  stats.warnChunkSize = data.size;
                stats.table.push([
                  colorize(data.size, file),
                  colorize(
                    data.size,
                    stats.previousFileStats && stats.previousFileStats[file]
                      ? `${fileSize(data.size)} ${getDiff(data.size, stats.previousFileStats[file].size)}`
                      : fileSize(data.size),
                  ),
                  data.gzip
                    ? stats.previousFileStats && stats.previousFileStats[file] && stats.previousFileStats[file].gzip
                      ? `${fileSize(data.gzip)} ${getDiff(data.gzip, stats.previousFileStats[file].gzip)}`
                      : fileSize(data.gzip)
                    : null,
                  data.brotli
                    ? stats.previousFileStats && stats.previousFileStats[file] && stats.previousFileStats[file].brotli
                      ? `${fileSize(data.brotli)} ${getDiff(data.brotli, stats.previousFileStats[file].brotli)}`
                      : fileSize(data.brotli)
                    : null,
                ]);
              });
            if (
              sumRow[1] > opts.warnBundleSize &&
              (!sumRow[2] || sumRow[2] > opts.warnBundleSize) &&
              (!sumRow[3] || sumRow[3] > opts.warnBundleSize)
            )
              stats.warnBundleSize = sumRow[1];
            stats.table.push(
              sumRow.map((v, c) => {
                return c > 0 && v ? fileSize(v) : v;
              }),
            );
          });
          return true;
        },
      },
    ],
    {
      showSubtasks: true,
      renderer: opts.silent && SilentRenderer,
    },
  );

  return tasks.run({ stats: [] }).then(res => {
    const stats = res.stats;
    const compilerStats = getCompilationStats(stats.map(s => s.build.stats));
    debugger;
    log(
      `${chalk.green(figures.tick)} Build completed in ${chalk.cyan(
        `${compilerStats.timings.total.duration}ms`,
      )} for ${chalk.cyan(compilerStats.numberOfConfigs)} configs`,
    );
    stats.forEach(({ build, table: tableData, warnChunkSize, warnBundleSize }, i) => {
      log(`
Input config (${chalk.cyan(i)}):     ${chalk.cyan(build.configFile)}
Output path:          ${chalk.cyan(build.outputPath)}
Duration:             ${chalk.cyan(`${build.duration}ms`)}`);
      if (build.options.target !== 'node' && tableData) {
        log(
          table(tableData, {
            drawHorizontalLine: (index, size) => index === 0 || index === 1 || index === size - 1 || index === size,
          }),
        );
        if (warnChunkSize)
          log(
            chalk.redBright(
              `At least one of your chunks are bigger (${chalk.cyan(
                fileSize(warnChunkSize),
              )}) than your defined maximum chunk size of ${chalk.cyan(fileSize(opts.warnChunkSize))}`,
            ),
          );
        if (warnBundleSize)
          log(
            chalk.redBright(
              `Your bundle is bigger (${chalk.cyan(
                fileSize(warnBundleSize),
              )}) than your defined maximum bundle size of ${chalk.cyan(fileSize(opts.warnBundleSize))}`,
            ),
          );
      }
    });
  });
};
