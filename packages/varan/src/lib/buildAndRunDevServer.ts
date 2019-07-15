import { defaults } from 'lodash';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import BuildError from './BuildError';

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
export interface Output {
  compiler: webpack.Compiler;
  stats: webpack.Stats;
  runner: null | WebpackDevServer;
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
  config: webpack.Configuration,
  host: string,
  port: number,
  options: Partial<Options>,
): Promise<Output> {
  const opts = getOpts(options);
  const compiler = webpack(config);
  if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

  // Use webpack-dev-server ?
  if (config.devServer) {
    return new Promise((resolve, reject) => {
      let initialBuild = true;
      const devServerConfig: WebpackDevServer.Configuration = {
        host,
        port,
        ...config.devServer,
        proxy: (opts.devServerProxy && config.devServer && config.devServer.proxy) || undefined,
        open: opts.openBrowser,
      };

      // Add wait for promise middleware?
      if (opts.waitForPromise) {
        devServerConfig.before = function devServerBefore(app, server) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          app.use((req, res, next) => opts.waitForPromise!.then(next));
          if (config.devServer && config.devServer.before) config.devServer.before(app, server);
        };
      }

      const devServer: WebpackDevServer & { waitForPromise?: null | Promise<any> } = new WebpackDevServer(
        compiler,
        devServerConfig,
      );
      devServer.waitForPromise = opts.waitForPromise;
      devServer.listen(port, host, err => {
        if (err) reject(err);
      });
      compiler.hooks.done.tap(pkg.name, stats => {
        if (initialBuild) {
          initialBuild = false;
          resolve({
            compiler,
            stats,
            runner: devServer,
            errors: [],
            warnings: [],
          });
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
