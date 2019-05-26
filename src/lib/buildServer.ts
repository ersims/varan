// Dependencies
import { defaults } from 'lodash';
import webpack from 'webpack';
import BuildError from './BuildError';

// Types
export interface Options {
  inputFileSystem?: webpack.Compiler['inputFileSystem'];
  outputFileSystem?: webpack.Compiler['outputFileSystem'];
}
export interface Output {
  compiler: webpack.Compiler;
  stats: webpack.Stats;
  watcher: webpack.Compiler.Watching;
  errors: string[];
  warnings: string[];
}

// Init
const getOpts = (options: Partial<Options>): Options => defaults({}, options, {});

// Exports
export default async function buildServer(config: webpack.Configuration, options: Partial<Options>): Promise<Output> {
  const opts = getOpts(options);
  const compiler = webpack(config);
  if (opts.inputFileSystem) compiler.inputFileSystem = opts.inputFileSystem;
  if (opts.outputFileSystem) compiler.outputFileSystem = opts.outputFileSystem;

  // Create builder promise
  return new Promise((resolve, reject) => {
    // Watch
    const watcher = compiler.watch({}, (err, stats) => {
      if (err) return reject(err);
      const out: Output = {
        watcher,
        compiler,
        stats,
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
    });
  });
}
