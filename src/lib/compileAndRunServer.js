// Dependencies
const webpack = require('webpack');
const path = require('path');
const nodemon = require('nodemon');
const pkg = require('../../package.json');

// Exports
module.exports = log => async (config, args) => new Promise((resolve, reject) => {
  const compiler = webpack(config);
  const watching = compiler.watch({}, (err, stats) => {
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
  let watcher;
  compiler.hooks.done.tap(pkg.name, (stats) => {
    if (!watcher) {
      // Pass in arguments to child
      const launchArgs = args.includes('--') ? args.slice(args.indexOf('--') + 1) : [];
      const debugArgs = [...new Set(launchArgs.concat(process.env.NODE_DEBUG_OPTION || []).filter(arg => arg.startsWith('--inspect') || arg.startsWith('--debug')))];
      const debugPort = (debugArgs.length > 0) ? process.debugPort + 1 : process.debugPort;
      const execArgs = launchArgs.filter(arg => !debugArgs.includes(arg)).concat(debugArgs.map(arg => arg.replace(process.debugPort, debugPort)));
      try {
        watcher = nodemon({ quiet: true, verbose: false, script: serverOutputEntry, watch: false, execArgs });
        resolve(watching);
      } catch (err) {
        reject(err);
      }

      watcher.on('log', log);
      watcher.on('start', () => {
        if (watcher._shouldRestart) log('🔁  Server restarting');
        else log('✅  Server starting');
        watcher._shouldRestart = false;
      });
      watcher.on('exit', () => {
        watcher._shouldRestart = true;
        log('❌  Server stopped - waiting for changes to try again');
      });
      watcher.on('quit', () => {
        watcher._shouldRestart = true;
        log('❌  Server stopped - waiting for changes to try again');
      });
      watcher.on('error', (err) => {
        watcher._shouldRestart = true;
        console.error('❌  Server error - waiting for changes to try again');
        if (err) console.error(err);
      });
      watcher.on('crash', () => {
        watcher._shouldRestart = true;
        console.error('❌  Server crashed - waiting for changes to try again');
      });
    } else if (watcher._shouldRestart) watcher.restart();
    else log('🔁  Assets recompiled');
  });
});
