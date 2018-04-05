// Dependencies
const {
  DefinePlugin,
  EnvironmentPlugin,
} = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const defaults = require('lodash.defaults');
const path = require('path');
const common = require('./common.js');
const getPaths = require('../src/lib/getPaths');
const serverBabelConfig = require('../babel/server');

// Init
const HotReloadEntry = `${require.resolve('webpack/hot/poll')}?1000`;
const getOpts = (options) => {
  const paths = getPaths(options.cwd);
  return defaults({}, options, {
    env: process.env.NODE_ENV,
    name: undefined,
    appDir: paths.appDir,
    appSourceDir: paths.appSourceDir,
    appTargetDir: paths.appTargetDir,
    targetDir: paths.server.targetDir,
    sourceDir: paths.server.sourceDir,
    entry: paths.server.entry,
  })
};

// Exports
module.exports = (options) => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  return merge.smart(common(options), {
    target: 'node',
    name: opts.name || path.basename(opts.entry),
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    entry: [
      isDev && HotReloadEntry,
      require.resolve(path.resolve(opts.sourceDir, opts.entry)),
    ].filter(Boolean),
    output: {
      path: path.resolve(opts.targetDir, path.dirname(opts.entry)),
      filename: path.basename(opts.entry),
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
      rules: [{
        test: /\.(js|jsx|mjs)$/,
        exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: isDev,
          ...serverBabelConfig,
        },
      }],
    },
    plugins: [
      new DefinePlugin({
        'process.env.BABEL_ENV': JSON.stringify(opts.env),
      }),
      new EnvironmentPlugin({
        BUILD_TARGET: 'server',
        DEBUG: false,
      }),
    ].filter(Boolean),
    node: {
      __dirname: false,
      __filename: false,
    },
  });
};
