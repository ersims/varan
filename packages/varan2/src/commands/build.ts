import { resolve } from 'path';
import chalk from 'chalk';
import { getBorderCharacters, table } from 'table';
import { build as buildWebpack } from '../lib/build';
import { loadConfig } from '../lib/config/loadConfig';
import { validateConfig } from '../lib/config/validateConfig';
import { createManifestComparisonTable } from '../lib/createManifestComparisonTable';
import { VaranCliOptions } from '../types/VaranCliOptions';
import { emojis } from '../lib/emojis';

// Types
interface BuildCommandOptions extends VaranCliOptions {}

// Init
const mark = (v: string) => chalk.cyan(v);
const warn = (v: string) => chalk.yellow(v);
const bad = (v: string) => chalk.red(v);

// Exports
export const build = async (options: BuildCommandOptions) => {
  const { config, silent } = options;

  // Load a user configuration if possible
  let userConfig = await loadConfig(resolve(process.cwd(), config));

  // Handle the configuration factory pattern
  if (typeof userConfig === 'function') userConfig = await userConfig(options);

  // Validate and apply defaults
  const customConfig = validateConfig({ ...userConfig });

  // Run build
  const { tasks, endTime, startTime } = await buildWebpack(customConfig);
  const mode = tasks.reduce((acc, { stats }, i) => {
    const out = stats?.compilation.options.mode || acc;
    if (i === 0) return out;
    if (out !== acc) return 'mixed';
    return acc;
  }, 'unknown');

  // Print beautiful tables with stats if not silent
  if (!silent) {
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
      `  Compiled ${mark(tasks.length.toString())} config${tasks.length !== 1 ? 's' : ''} in ${mark(
        mode,
      )} mode in ${mark(`${endTime! - startTime}ms`)}`,
    );
    console.log();

    /**
     * Task stats
     */
    tasks.forEach(({ config: taskConfig, stats, currentManifest, lastManifest }, i) => {
      /**
       * Summary
       */
      if (stats) {
        const tableTotals = [
          [`Config file (${mark((i + 1).toString())}/${mark(tasks.length.toString())})`, mark(taskConfig)],
          ['Target directory', mark(stats.compilation.outputOptions.path || '-')],
          ['Duration', mark(`${stats.endTime - stats.startTime!}ms`)],
        ];
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

      /**
       * Asset list
       */
      if (currentManifest) {
        const warnSize = stats?.compilation.options.performance
          ? stats.compilation.options.performance.maxAssetSize || null
          : null;
        console.log();
        console.log(
          createManifestComparisonTable({
            warnSize,
            currentManifest,
            lastManifest,
          }),
        );
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
