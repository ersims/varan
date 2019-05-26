// Dependencies
import { defaults, get, omit, set } from 'lodash';
import serve from 'webpack-serve';
import webpack from 'webpack';
import BuildError from './BuildError';

// eslint-disable-next-line
const pkg = require('../../package.json');

// Types
export interface Options {
  devServerProxy: boolean;
  devServerWSPort: number;
  openBrowser: boolean;
  waitForPromise: null | Promise<any>;
  inputFileSystem?: webpack.Compiler['inputFileSystem'];
  outputFileSystem?: webpack.Compiler['outputFileSystem'];
}
export interface VaranServeOptions extends serve.Options {
  proxy?: boolean;
  waitForPromise?: null | Promise<any>;
}
export interface Output {
  compiler: webpack.Compiler;
  stats: webpack.Stats;
  app: null | serve.Result['app'];
  runner: null | Promise<serve.Result>;
  errors: string[];
  warnings: string[];
}

// Init
const getOpts = (options: Partial<Options>): Options =>
  defaults({}, options, {
    waitForPromise: null,
    devServerProxy: false,
    openBrowser: false,
    devServerWSPort: 3002,
  });

// Exports
export default async function buildAndRunDevServer(
  config: webpack.Configuration & { serve?: VaranServeOptions },
  host: string,
  port: number,
  options: Partial<Options>,
): Promise<Output> {
  const opts = getOpts(options);
  const compiler = webpack(omit(config, ['serve']));
  if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

  // Use webpack-serve ?
  if (config.serve) {
    return new Promise((resolve, reject) => {
      let initialBuild = true;
      const serveConfig: VaranServeOptions = {
        host,
        port,
        compiler,
        waitForPromise: opts.waitForPromise,
        ...config.serve,
        hotClient: {
          host,
          port: opts.devServerWSPort,
          ...get(config, 'serve.hotClient', {}),
        },
        proxy: opts.devServerProxy,
        open: opts.openBrowser,
      };

      // Disable write to disk?
      if (compiler.outputFileSystem.constructor.name !== 'NodeOutputFileSystem') {
        set(serveConfig, 'devMiddleware.writeToDisk', false);
      }

      const devServer = serve({}, serveConfig);
      compiler.hooks.done.tap(pkg.name, stats => {
        if (initialBuild) {
          initialBuild = false;
          devServer
            .then(res =>
              resolve({
                compiler,
                stats,
                runner: devServer,
                errors: [],
                warnings: [],
                app: res.app,
              }),
            )
            .catch(reject);
        }
      });
    });
  }
  return new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) return reject(err);
      const out: Output = {
        compiler,
        stats,
        app: null,
        runner: null,
        errors: [],
        warnings: [],
      };

      const info = stats.toJson();
      out.errors = info.errors;
      out.warnings = info.warnings;
      if (stats.hasErrors() || info.errors.length > 0) {
        const buildError = new BuildError('Build failed with errors');
        buildError.errors = out.errors;
        buildError.warnings = out.warnings;
        return reject(buildError);
      }

      return resolve(out);
    }),
  );
}
