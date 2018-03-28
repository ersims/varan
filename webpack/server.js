// Dependencies
const { EnvironmentPlugin } = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const defaults = require('lodash.defaults');
const path = require('path');
const common = require('./common.js');
const getPaths = require('../src/getPaths');

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
      path: path.resolve(opts.targetDir),
      filename: opts.entry,
      pathinfo: true,
      publicPath: '/',
      libraryTarget: 'commonjs2',
    },
    externals: [
      // nodeExternals({
      //   modulesDir: path.resolve(process.cwd(), 'node_modules'),
      //   whitelist: [isDev && HotReloadEntry].filter(Boolean),
      // }),
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
          compact: !isDev,
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                targets: {
                  node: 'current',
                },
                modules: false,
                shippedProposals: true,
              },
            ],
            require.resolve('@babel/preset-react'),
          ],
          plugins: [
            require.resolve('@babel/plugin-proposal-class-properties'),
            require.resolve('@babel/plugin-syntax-dynamic-import'),
          ],
          env: {
            development: {
              plugins: [
                require.resolve('@babel/plugin-transform-react-jsx-source'),
                require.resolve('@babel/plugin-transform-react-jsx-self'),
              ],
            },
            production: {
              plugins: [
                require.resolve('@babel/plugin-transform-react-constant-elements'),
                require.resolve('@babel/plugin-transform-react-inline-elements'),
              ],
            },
          },
        },
      }],
    },
    plugins: [
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
