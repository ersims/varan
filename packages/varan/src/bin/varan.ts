#!/usr/bin/env node
import 'source-map-support/register';
import dotenv from 'dotenv';

dotenv.config();

/* eslint-disable import/first */
import program from 'commander';
import path from 'path';
import updateNotifier from 'update-notifier';
import chalk from 'chalk';
import ora from 'ora';
import { format } from 'url';
import { get } from 'lodash';
import { getBorderCharacters, table } from 'table';
import fileSize from 'filesize';
import createLogger from '../lib/createLogger';
import emojis from '../lib/emojis';
import { build, watch } from '../index';
import getCompilerStats from '../lib/getCompilerStats';
import { BuildStats } from '../lib/getBuildStatsFromManifest';
/* eslint-enable import/first */

// eslint-disable-next-line
const pkg = require('../../package.json');

// Init
process.on('unhandledRejection', err => {
  throw err;
});
const resolve = (file: string) => {
  const varanLocalPath = `varan/`;
  return file.startsWith(varanLocalPath)
    ? path.resolve(__dirname, '..', '..') + path.sep + file.substr(varanLocalPath.length)
    : file && path.resolve(process.cwd(), file);
};

// Check for updates
updateNotifier({ pkg }).notify();

// Setup program
program.usage('<command> [options]').version(pkg.version);

/**
 * Build application
 */
program
  .command('build [files...]')
  .option('--env <environment>', 'Environment to use.', 'production')
  .option('-a, --analyze', 'Analyze build')
  .option('-s, --silent', 'Disable output')
  .action(async (files: string[], opts: { analyze?: boolean; env: 'development' | 'production'; silent?: boolean }) => {
    const log = createLogger({ silent: opts.silent });
    const env = (opts && opts.env) || 'production';
    const configs = (files.length > 0 && files.map(resolve)) || [
      path.resolve(__dirname, '..', '..', 'webpack', 'server'),
      path.resolve(__dirname, '..', '..', 'webpack', 'client'),
    ];
    try {
      log.info();
      log.info(
        `  Building ${chalk.cyan(configs.length.toString())} configs for ${chalk.cyan(env)} using ${chalk.cyan(
          pkg.name,
        )} ${chalk.cyan(`v${pkg.version}`)} ${chalk.green(emojis.robot)}`,
      );
      log.info();

      /**
       * Run build
       */
      const { result, options } = await build({
        ...opts,
        verbose: !opts.silent,
        configs,
        env,
      });

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
              if (warnSize && current[key] > warnSize) out = chalk.yellow(out);
              if (comparisonObject && comparisonObject[current.name]) {
                const previous = comparisonObject[current.name] as typeof current;
                if (previous[key]) {
                  if (current[key] > previous[key])
                    out += `  + ${chalk.yellow(fileSize(current[key] - previous[key]))}`;
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
                chunk ? options.warnChunkSize : options.warnAssetSize,
              );
            const ignoreExtensions = ['.br', '.gz'];
            const tableRows = [
              ...Object.values(stat.currentBuild.chunks),
              ...Object.values(stat.currentBuild.assets)
                .filter(asset => !ignoreExtensions.includes(path.extname(asset.name).toLocaleLowerCase()))
                .filter(asset => Object.keys(asset.chunks).length === 0),
            ]
              .sort((a, b) => b.size - a.size)
              .reduce<(string | number | null | undefined)[][]>((acc, cur) => {
                if (isChunk(cur)) {
                  const chunkTooBig = options.warnChunkSize && cur.size > options.warnChunkSize;
                  const name = chunkTooBig ? chalk.yellow(`[${cur.name}]`) : chalk.gray(`[${cur.name}]`);
                  acc.push([
                    name,
                    chalk.gray(printSize('size', cur, true) || ''),
                    chalk.gray(printSize('gzip', cur, true) || ''),
                    chalk.gray(printSize('brotli', cur, true) || ''),
                  ]);
                  Object.values(cur.assets)
                    .sort((a, b) => b.size - a.size)
                    .forEach(asset => {
                      let assetName;
                      if (options.warnAssetSize && asset.size > options.warnAssetSize)
                        assetName = chalk.yellow(asset.name);
                      else assetName = asset.name;
                      acc.push([
                        `  ${assetName}${Object.keys(asset.chunks).length > 1 ? ' +' : ''}`,
                        printSize('size', asset),
                        printSize('gzip', asset),
                        printSize('brotli', asset),
                      ]);
                    });
                } else {
                  const name =
                    options.warnAssetSize && cur.size > options.warnAssetSize ? chalk.yellow(cur.name) : cur.name;
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
    } catch (err) {
      log.error();
      log.error(`  ${chalk.red(emojis.failure)} Failure! Failed to build project ${chalk.red(emojis.failure)}`);
      if (err.details) log.error(`  ${chalk.cyan('Details:')} ${err.details}`);
      if (err.errors) log.error(`  ${err.errors}`);
      else if (err.stack) log.error(`  ${err.stack}`);
      log.error();
    }
  });

/**
 * Development watching mode
 */
program
  .command('watch [files...]')
  .usage('[options] [files...] -- --inspect')
  .option('-s, --silent', 'Disable output')
  .option('--host <host>', 'Specify host for both client and server to bind on')
  .option('--client-port <port number>', 'Specify client dev server port to listen on', port => parseInt(port, 10))
  .option('--server-port <port number>', 'Specify server port to listen on', port => parseInt(port, 10))
  .option('--env <development|production>', 'Environment to use')
  .option('--open', 'Open app in browser automatically?')
  .action(async (rawFiles: string[], opts) => {
    const log = createLogger({ silent: opts.silent });
    // eslint-disable-next-line no-param-reassign
    opts.args = process.argv.includes('--') ? process.argv.slice(process.argv.indexOf('--') + 1) : [];
    const env = (opts && opts.env) || 'development';
    const files = rawFiles.filter(f => !opts.args.includes(f));
    const configs = (files.length > 0 && files.map(resolve)) || [
      path.resolve(__dirname, '..', '..', 'webpack', 'server'),
      path.resolve(__dirname, '..', '..', 'webpack', 'client'),
    ];

    try {
      log.info();
      log.info(
        `  Watching project with ${chalk.cyan(configs.length.toString())} configs in ${chalk.cyan(
          env,
        )} mode using ${chalk.cyan(pkg.name)} ${chalk.cyan(`v${pkg.version}`)} ${chalk.green(emojis.robot)}`,
      );
      log.info();

      /**
       * Run watcher
       */
      const watcher = await watch({
        configs,
        env,
        verbose: !opts.silent,
        devServerHost: opts && opts.host,
        devServerPort: opts && opts.clientPort,
        serverHost: opts && opts.host,
        serverPort: opts && opts.serverPort,
        args: opts && opts.args,
        openBrowser: opts && opts.open,
        silent: opts && opts.silent,
      });
      const hasWarnings =
        (watcher.client && watcher.client.warnings.length > 0) ||
        (watcher.server && watcher.server.warnings.length > 0);

      // Fetch statistics
      log.info();
      log.info();
      log.info(
        `  ${chalk.green(emojis.rocket)} Success! ${
          hasWarnings ? `${chalk.yellow('With warnings. See below for more information!')} ` : ''
        }${chalk.green(emojis.rocket)}`,
      );
      log.info(
        `  Compiled ${chalk.cyan(watcher.totals.numberOfConfigs.toString())} configs in ${chalk.cyan(
          `${watcher.totals.timings.duration}ms`,
        )}`,
      );
      if (watcher.server)
        log.info(`  Server compiled in ${chalk.cyan(`${watcher.totals.timings.perCompiler[0].duration}ms`)}`);
      if (watcher.client)
        log.info(
          `  Client compiled in ${chalk.cyan(
            `${watcher.totals.timings.perCompiler[watcher.server ? 1 : 0].duration}ms`,
          )}`,
        );
      log.info();
      log.info();

      // Integrate with server
      if (watcher.server) {
        const serverCompileSpinner = ora({
          spinner: 'circleHalves',
          text: chalk.bold('Server recompiling'),
        });

        // Begin recompile
        watcher.server.compiler.hooks.invalid.tap(pkg.name, () => {
          serverCompileSpinner.start();
        });
        watcher.server.compiler.hooks.done.tap(pkg.name, stats => {
          const compileStats = getCompilerStats(stats);
          const info = stats.toJson();
          if (stats.hasErrors()) {
            serverCompileSpinner.fail(
              chalk.bold(
                `Server failed to recompile in ${chalk.cyan(`${compileStats.timings.duration}ms`)} due to ${chalk.red(
                  'errors',
                )}`,
              ),
            );
            // Log errors
            if (info.errors.length > 0) setImmediate(() => info.errors.forEach((error: string) => log.error(error)));
          } else {
            serverCompileSpinner.succeed(
              chalk.bold(`Server recompiled in ${chalk.cyan(`${compileStats.timings.duration}ms`)}`),
            );
          }
        });

        // Pass logging through
        if (watcher.server.runner.stdout) {
          watcher.server.runner.stdout.on(
            'data',
            data =>
              !data.toString().startsWith('[HMR]') &&
              log.info(`${chalk.cyan(`${emojis.speechBalloon} SERVER:`)} ${data.toString()}`),
          );
        }
        if (watcher.server.runner.stderr) {
          watcher.server.runner.stderr.on('data', data =>
            log.error(`${chalk.cyan(`${emojis.speechBalloon} SERVER:`)} ${data.toString()}`),
          );
        }
      }

      // Integrate with client
      if (watcher.client) {
        const clientCompileSpinner = ora({
          spinner: 'hearts',
          text: chalk.bold('Client recompiling'),
        });

        // Begin recompile
        watcher.client.compiler.hooks.invalid.tap(pkg.name, () => {
          clientCompileSpinner.start();
        });
        watcher.client.compiler.hooks.done.tap(pkg.name, stats => {
          const compileStats = getCompilerStats(stats);
          if (stats.hasErrors()) {
            const stat: { errors: string[] } = stats.toJson();
            clientCompileSpinner.fail(
              chalk.bold(
                `Client failed to recompile in ${chalk.cyan(`${compileStats.timings.duration}ms`)} due to ${chalk.red(
                  'errors',
                )}`,
              ),
            );
            stat.errors.forEach(error => log.error(`   ${chalk.red(emojis.smallSquare)} ${error}`));
          } else {
            clientCompileSpinner.succeed(
              chalk.bold(`Client recompiled in ${chalk.cyan(`${compileStats.timings.duration}ms`)}`),
            );
          }
        });

        const urlToClient = get(
          watcher,
          'client.compiler.options.output.publicPath',
          format({
            protocol: opts.devServerProtocol,
            hostname: ['0.0.0.0', '::'].includes(opts.devServerHost) ? 'localhost' : opts.devServerHost,
            port: opts.devServerPort,
            pathname: '/',
          }),
        );
        log.info(`  Development server is now ready and you can view your project in the browser`);
        log.info();
        log.info(
          `      ${chalk.cyan(emojis.pointRight)}  ${chalk.bold(chalk.cyan(urlToClient))}  ${chalk.cyan(
            emojis.pointLeft,
          )}`,
        );
        log.info();
        log.info();
      }

      // Register close listeners
      ['SIGTERM', 'SIGINT'].forEach((signal: any) =>
        process.on(signal, async () => {
          try {
            log.info(`Received ${signal}. Shutting down gracefully.`);
            let isDone = false;
            if (watcher) {
              await Promise.race([
                watcher.close().then(() => {
                  isDone = true;
                }),
                new Promise(resolvePromise => setTimeout(() => !isDone && resolvePromise(), 5000)),
              ]);
            }
            process.exit(0);
          } catch (err) {
            log.error(`Failed to handle ${signal} gracefully. Exiting with status code 1`);
            process.exit(1);
          }
        }),
      );
    } catch (err) {
      log.error();
      log.error(`  ${chalk.red(emojis.failure)} Failure! Failed to watch project ${chalk.red(emojis.failure)}`);
      if (err.details) log.error(`  ${chalk.cyan('Details:')} ${err.details}`);
      if (err.errors) log.error(`  ${err.errors}`);
      else if (err.stack) log.error(`  ${err.stack}`);
      log.error();
    }
  });

// Run
if (!process.argv.slice(2).length) program.outputHelp();
else program.parse(process.argv);
