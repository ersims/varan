// Dependencies
const webpack = require('webpack');
const path = require('path');
const spawn = require('react-dev-utils/crossSpawn');
const figures = require('figures');
const chalk = require('chalk');
const getCompilationStats = require('./getCompilationStats');
const pkg = require('../../package.json');

// Init
class Manager {
  constructor(watcher, runner) {
    this.watcher = watcher;
    this.runner = runner;

    // Handle closing
    ['exit', 'SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2', 'uncaughtException'].forEach(signal =>
      process.on(signal, code => {
        this.close();
        process.exit(code);
      }),
    );
  }
  stop() {
    this.close();
  }
  close() {
    if (this.watcher) this.watcher.close();
    if (this.runner) this.runner.kill();
  }
}

// Exports
module.exports = log => async (config, opts, waitForResolved) =>
  new Promise((resolve, reject) => {
    const launchArgs = opts.args;
    const compiler = webpack(config);
    if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
    if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

    const watcher = compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        return reject(new Error('Build failed'));
      }
      const info = stats.toJson();
      if (stats.hasErrors()) console.error(info.errors.map(e => e.split('\n')));
      if (stats.hasWarnings()) console.warn(info.warnings);
    });

    // Add event handling
    const serverOutputEntry = path.resolve(compiler.options.output.path, compiler.options.output.filename);
    let runner;
    compiler.hooks.done.tap(pkg.name, async stats => {
      const buildStats = getCompilationStats(stats);
      if (!runner) {
        log(`${chalk.green(figures.tick)} Server compiled in ${buildStats.timings.total.duration}ms`);
        // Pass in arguments to child
        const debugArgs = [
          ...new Set(
            launchArgs
              .concat(process.env.NODE_DEBUG_OPTION || [])
              .filter(arg => arg.startsWith('--inspect') || arg.startsWith('--debug')),
          ),
        ];
        const debugPort = debugArgs.length > 0 ? process.debugPort + 1 : process.debugPort;
        const execArgs = launchArgs
          .filter(arg => !debugArgs.includes(arg))
          .concat(debugArgs.map(arg => arg.replace(process.debugPort, debugPort)));
        try {
          if (waitForResolved) await waitForResolved;
          runner = spawn('node', execArgs.concat(serverOutputEntry));
          resolve(new Manager(watcher, runner));
        } catch (err) {
          reject(err);
        }

        // Handle logging
        runner.stdout.on('data', log);
        runner.stderr.on('data', data => data && data.toString && console.error(data.toString()));

        // Let server be restarted if it closed prematurely
        runner.on('close', code => {
          runner = null;
          if (code === 1) log(`${chalk.redBright(figures.cross)} Server stopped - waiting for changes to try again`);
        });
      } else log(`${chalk.yellow(figures.circleFilled)} Server recompiled in ${buildStats.timings.total.duration}ms`);
    });
  });
