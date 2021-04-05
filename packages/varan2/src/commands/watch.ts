import path, { relative, normalize } from 'path';
import chalk from 'chalk';
import { getBorderCharacters, table } from 'table';
import internalIp from 'internal-ip';
import { watch as watchWebpack } from '../lib/watch';
import { loadConfig } from '../lib/config/loadConfig';
import { validateConfig } from '../lib/config/validateConfig';
import { VaranCliOptions } from '../types/VaranCliOptions';
import { emojis } from '../lib/emojis';
import { watcherRecompileSpinner } from '../lib/watcherRecompileSpinner';
import { resolveAppRelativePath } from '../lib/resolveAppRelativePath';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

// Types
interface WatchCommandOptions extends VaranCliOptions {}

// Init
const mark = (v: string) => chalk.cyan(v);
const warn = (v: string) => chalk.yellow(v);
const bad = (v: string) => chalk.red(v);

// Exports
export const watch = async (options: WatchCommandOptions) => {
  const { config, silent } = options;

  // Load a user configuration if possible
  let userConfig = await loadConfig(path.resolve(process.cwd(), config));

  // Handle the configuration factory pattern
  if (typeof userConfig === 'function') userConfig = await userConfig(options);

  // Validate and apply defaults
  const customConfig = validateConfig({ ...userConfig });

  // Run watcher
  const { tasks, endTime, startTime } = await watchWebpack(customConfig);
  const mode = tasks.reduce((acc, { stats }, i) => {
    const out = stats?.compilation.options.mode || acc;
    if (i === 0) return out;
    if (out !== acc) return 'mixed';
    return acc;
  }, 'unknown');

  // Print beautiful tables with stats if not silent
  if (!silent) {
    // Init
    const networkIp = await internalIp.v4();

    /**
     * Success summary
     */
    const hasWarnings = tasks.some((task) => task.stats?.hasWarnings());
    console.log();
    console.log(
      `  ${chalk.green(emojis.rocket)} Success! ${
        hasWarnings ? `${warn('With warnings. See below for more information!')} ` : ''
      }${chalk.green(emojis.rocket)}`,
    );
    console.log();
    console.log(
      `  Watching ${mark(tasks.length.toString())} config${tasks.length !== 1 ? 's' : ''} in ${mark(
        mode,
      )} mode in ${mark(`${endTime! - startTime}ms`)}`,
    );
    console.log();

    /**
     * Task stats
     */
    tasks.forEach(({ config: taskConfig, stats, compiler, devServer }, i) => {
      /**
       * Summary
       */
      if (stats) {
        // Fetch devServer listening url
        let devServerLocalUrl;
        let devServerInternalUrl;
        if (devServer && compiler) {
          const protocol = compiler.options.devServer?.https ? 'https' : 'http';
          const host = compiler.options.devServer?.host || 'localhost';
          const port = compiler.options.devServer?.port || 3000;
          devServerLocalUrl = new URL(
            `${protocol}://${['0.0.0.0', '::'].includes(host) ? 'localhost' : host}:${port}`,
          ).toString();
          devServerInternalUrl = new URL(`${protocol}://${networkIp}:${port}`).toString();
        }

        const tableTotals = [
          [`Config file (${mark((i + 1).toString())}/${mark(tasks.length.toString())})`, mark(taskConfig)],
          ['Target directory', mark(stats.compilation.outputOptions.path || '-')],
          ['Duration', mark(`${stats.endTime - stats.startTime!}ms`)],
          devServerLocalUrl && [`Local address ${chalk.cyan(emojis.pointRight)}`, mark(devServerLocalUrl)],
          devServerInternalUrl && [`Network address ${chalk.cyan(emojis.pointRight)}`, mark(devServerInternalUrl)],
        ].filter(Boolean);
        console.log();
        console.log(
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
      }

      // Integrate with compiler
      if (compiler) {
        const clientCompileSpinner = watcherRecompileSpinner('Recompiling');
        // Add hooks for compile feedback
        compiler.hooks.invalid.tap(pkg.name, (file) => {
          const sourceFile = file && normalize(relative(resolveAppRelativePath(''), file));
          clientCompileSpinner.start(chalk.bold(sourceFile ? `Recompiling ${sourceFile}` : 'Recompiling'));
        });
        compiler.hooks.done.tap(pkg.name, (newStats) => {
          if (newStats.hasErrors()) {
            const { errors, timings } = newStats.toJson({ errors: true, timings: true });
            clientCompileSpinner.fail(
              chalk.bold(
                `Failed to recompile in ${mark(`${newStats.endTime - newStats.startTime}ms`)} due to ${bad('errors')}`,
              ),
            );
            errors!.forEach((error) => console.log(`   ${bad(emojis.smallSquare)} ${error.message}`));
          } else {
            clientCompileSpinner.succeed(
              chalk.bold(`Successfully recompiled in ${mark(`${newStats.endTime - newStats.startTime}ms`)}`),
            );
          }
        });
      }

      const stat = stats?.toJson({ errors: true, warnings: true });
      if (stat) {
        /**
         * Warnings
         */
        if (stat.warnings && stat.warnings.length > 0) {
          console.warn(`  ${warn(`${emojis.warning} Warnings`)}`);
          stat.warnings.forEach((warning) => {
            console.log();
            console.warn(`   ${warn(emojis.smallSquare)} ${warning.message}`);
          });
        }

        /**
         * Errors
         */
        if (stat.errors && stat.errors.length > 0) {
          console.error(`  ${bad(`${emojis.failure} Errors`)}`);
          stat.errors.forEach((error) => {
            console.log();
            console.error(`   ${bad(emojis.smallSquare)} ${error.message}`);
          });
        }
      }
    });
  }
};
