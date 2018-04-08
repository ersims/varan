// Dependencies
const webpack = require('webpack');
const {
  createCompiler,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const WebpackDevServer = require('webpack-dev-server');
const pkg = require('../../package.json');

// Exports
module.exports = log => async (config, host, port, opts) => {
  const name = config.name || pkg.name;
  const urls = prepareUrls('http', host, port);
  const compiler = createCompiler(webpack, config, name, urls, false);
  if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

  if (compiler.options.devServer) {
    return new Promise((resolve, reject) => {
      let initialBuild = true;
      const devServer = new WebpackDevServer(compiler, compiler.options.devServer);
      devServer.listen(port, host, (err) => {
        if (err) return reject(err);
      });

      compiler.hooks.done.tap(pkg.name, () => {
        if (initialBuild) {
          resolve(devServer);
          initialBuild = false;
        }
      });
      return devServer;
    });
  } else {
    compiler.hooks.done.tap(pkg.name, () => log(`✅  Build complete for ${name}`));
    return new Promise((resolve, reject) => compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        return reject(err);
      }

      const info = stats.toJson();
      if (stats.hasErrors()) {
        console.error(info.errors.map(e => e.split('\n')));
        const error = new Error(`Build failed for ${name}`);
        error.details = info.errors;
        return reject(error);
      }
      if (stats.hasWarnings()) console.warn(info.warnings);
      resolve();
    }));
  }
};
