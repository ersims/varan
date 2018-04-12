// Dependencies
const webpack = require('webpack');
const {
  createCompiler,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const omit = require('lodash.omit');
const serve = require('webpack-serve');
const pkg = require('../../package.json');

// Exports
module.exports = log => async (config, host, port, opts) => {
  const name = config.name || pkg.name;
  const urls = prepareUrls('http', host, port);
  const compiler = createCompiler(webpack, omit(config, ['serve']), name, urls, false);
  if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

  if (config.serve) {
    return new Promise((resolve, reject) => {
      let initialBuild = true;
      const devServer = serve({
        host,
        port,
        compiler,
        ...config.serve,
        hot: {
          host,
          port: opts.devServerWSPort,
          ...config.serve.hot,
        },
      });
      compiler.hooks.done.tap(pkg.name, () => {
        if (initialBuild) {
          initialBuild = false;
          return devServer.then(resolve).catch(reject);
        }
      });
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
