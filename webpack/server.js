// Dependencies
const { DefinePlugin, EnvironmentPlugin, HotModuleReplacementPlugin } = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const defaults = require('lodash.defaults');
const path = require('path');
const common = require('./common.js');
const getPaths = require('../src/lib/getPaths');
const serverBabelPreset = require('../babel/server');

// Init
const HotReloadEntry = `${require.resolve('webpack/hot/poll')}?1000`;
const getOpts = options => {
  const paths = getPaths(options.cwd);
  return defaults({}, options, {
    env: process.env.NODE_ENV,
    target: 'node',
    name: undefined,
    appDir: paths.appDir,
    appSourceDir: paths.appSourceDir,
    appTargetDir: paths.appTargetDir,
    targetDir: paths.server.targetDir,
    sourceDir: paths.server.sourceDir,
    entry: paths.server.entry,
    clientTargetDir: paths.client.targetDir,
  });
};

// Exports
module.exports = options => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const outputPath = path.resolve(opts.targetDir, path.dirname(opts.entry));
  return merge.smart(common(opts), {
    name: opts.name || path.basename(opts.entry),
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    entry: [isDev && HotReloadEntry, path.resolve(opts.sourceDir, opts.entry)].filter(Boolean),
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
        whitelist: [isDev && HotReloadEntry].filter(Boolean),
      }),
      nodeExternals({
        whitelist: [isDev && HotReloadEntry].filter(Boolean),
        modulesDir: path.resolve(__dirname, '..', 'node_modules'),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(jsx?|mjs|tsx?)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: isDev,
            presets: [serverBabelPreset],
          },
        },
      ],
    },
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
      }),
      new EnvironmentPlugin({
        DEBUG: false,
      }),
    ].filter(Boolean),
    node: {
      __dirname: false,
      __filename: false,
    },
  });
};
