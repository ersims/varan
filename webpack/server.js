// Dependencies
const { EnvironmentPlugin } = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const defaults = require('lodash.defaults');
const path = require('path');
const common = require('./common.js');
const paths = require('../config/paths');

// Init
const isDev = process.env.NODE_ENV !== 'production';
const HotReloadEntry = isDev && `${require.resolve('webpack/hot/poll')}?1000`;
const defaultOpts = {
  targetDir: paths.server.targetDir,
  sourceDir: paths.server.sourceDir,
  entry: paths.server.entries.app,
  template: paths.client.templates,
};

// Exports
module.exports = (opts) => {
  const options = defaults({}, opts, defaultOpts);
  return merge.smart(common, {
    target: 'node',
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    entry: [
      isDev && HotReloadEntry,
      require.resolve(path.resolve(options.sourceDir, options.entry)),
    ].filter(Boolean),
    output: {
      path: path.dirname(path.resolve(options.targetDir, options.entry)),
      filename: path.extname(options.entry) ? path.basename(options.entry) : `${path.basename(options.entry)}.js`,
      pathinfo: true,
      publicPath: '/',
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
        NODE_ENV: 'development',
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
