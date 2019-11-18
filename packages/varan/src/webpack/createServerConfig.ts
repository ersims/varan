import { Configuration, DefinePlugin, EnvironmentPlugin, HotModuleReplacementPlugin, Plugin } from 'webpack';
import merge from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { defaults } from 'lodash';
import path from 'path';
import createCommonConfig from './createCommonConfig';

// Types
export interface ServerOptions {
  appDir: string;
  entry: string;
  name?: string;
  env: Configuration['mode'];
  target: Configuration['target'];
  clientTargetDir: string;
  targetDir: string;
  sourceDir: string;
  buildVars: {
    [key: string]: string;
  };
  whitelistExternals: string[];
}

// Init
const HotReloadEntry = `${require.resolve('webpack/hot/poll')}?1000`;
const getOpts = (options: Partial<ServerOptions>): ServerOptions => {
  const appDir = options.appDir || process.cwd();
  const resolve = (relativePath: string) => path.resolve(appDir, relativePath);
  return defaults({}, options, {
    appDir: resolve('./'),
    buildVars: {},
    entry: 'bin/web',
    env: process.env.NODE_ENV,
    target: 'node',
    name: undefined,
    targetDir: resolve('dist/server'),
    sourceDir: resolve('src/server'),
    clientTargetDir: resolve('dist/client'),
    whitelistExternals: [],
  });
};

/**
 * Create a webpack configuration optimized for server (node) applications
 *
 * @param {{ appDir: string=, buildVars: object=, entry: string=, env: 'development' | 'test' | 'production'=, target: 'web' | 'node'=, name: string=, targetDir: string=, sourceDir: string=, clientSourceDir: string=, whitelistExternals: string[]= }=} options
 * @returns {webpack.Configuration}
 */
export default (options: Partial<ServerOptions> = {}): Configuration => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const outputPath = path.resolve(opts.targetDir, path.dirname(opts.entry));
  return merge.smart(createCommonConfig(opts), {
    name: opts.name || path.basename(opts.entry),
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    entry: [isDev && HotReloadEntry, path.resolve(opts.sourceDir, opts.entry)].filter(Boolean) as string[],
    output: {
      path: outputPath,
      filename: `${path.basename(opts.entry, path.extname(opts.entry))}.js`,
      chunkFilename: 'chunks/[name].[contenthash:8].chunk.js',
      pathinfo: isDev,
      libraryTarget: 'commonjs2',
    },
    externals: [
      nodeExternals({
        modulesDir: path.resolve(process.cwd(), 'node_modules'),
        whitelist: [isDev && HotReloadEntry, /\.(?!(?:jsx?|tsx?|json)$).{1,5}$/i, ...opts.whitelistExternals].filter(
          Boolean,
        ) as string[],
      }),
      nodeExternals({
        modulesDir: path.resolve(__dirname, '..', 'node_modules'),
        whitelist: [isDev && HotReloadEntry, /\.(?!(?:jsx?|tsx?|json)$).{1,5}$/i, ...opts.whitelistExternals].filter(
          Boolean,
        ) as string[],
      }),
    ],
    plugins: [
      isDev && new HotModuleReplacementPlugin(),
      new DefinePlugin({
        BUILD_TARGET: JSON.stringify('server'),
        'process.env.BABEL_ENV': JSON.stringify(opts.env),
        'process.env.VARAN_CLIENT_ROOT': JSON.stringify(path.relative(outputPath, opts.clientTargetDir)),
        'process.env.VARAN_STATS_MANIFEST': JSON.stringify(
          path.relative(outputPath, path.resolve(opts.clientTargetDir, 'stats-manifest.json')),
        ),
        'process.env.VARAN_ASSETS_MANIFEST': JSON.stringify(
          path.relative(outputPath, path.resolve(opts.clientTargetDir, 'asset-manifest.json')),
        ),
        ...Object.entries(process.env)
          .filter(([key]) => key.startsWith('APP_BUILD_VAR_') || key.startsWith('REACT_APP_'))
          .reduce<{ [key: string]: string | undefined }>((acc, [key, value]) => {
            acc[`process.env.${key}`] = JSON.stringify(value);
            return acc;
          }, {}),
        ...opts.buildVars,
      }),
      new EnvironmentPlugin({
        DEBUG: false,
      }),
      new StatsWriterPlugin({
        filename: 'stats-manifest.json',
        fields: ['assetsByChunkName', 'assets'],
      }),
    ].filter(Boolean) as Plugin[],
    optimization: {
      namedModules: true,
      noEmitOnErrors: true,
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  });
};
