// Dependencies
const {
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
  NoEmitOnErrorsPlugin,
} = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const defaults = require('lodash.defaults');
const path = require('path');
const getPaths = require('../src/lib/getPaths');

// Init
const getOpts = (options) => {
  const paths = getPaths(options.cwd);
  return defaults({}, options, {
    env: process.env.NODE_ENV,
    appDir: paths.appDir,
  })
};

// Exports
module.exports = (options) => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  return {
    mode: isDev ? 'development' : 'production',
    bail: !isDev,
    context: opts.appDir,
    resolve: {
      extensions: ['.js', '.jsx', '.mjs', '.json'],
    },
    output: {
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    performance: isDev ? { hints: false } : undefined,
    stats: 'errors-only',
    module: {
      strictExportPresence: true,
      rules: [{
        oneOf: [
          {
            exclude: [/\.html$/, /\.(js|jsx|mjs)$/, /\.css$/, /\.scss$/, /\.json$/, /\.ico$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.(css|scss)$/,
            use: ExtractTextPlugin.extract({
              fallback: require.resolve('style-loader'),
              use: [
                { loader: require.resolve('css-loader'), options: { importLoaders: 1, minimize: !isDev } },
                { loader: require.resolve('resolve-url-loader') },
                { loader: require.resolve('sass-loader'), options: { sourceMap: true, precision: 10 } },
              ],
            }),
          },
          {
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: { name: 'static/media/[name].[hash:8].[ext]' },
          },
        ],
      }],
    },
    plugins: [
      isDev && new NamedModulesPlugin(),
      isDev && new HotModuleReplacementPlugin(),
      new NoEmitOnErrorsPlugin(),
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
      }),
      new StatsWriterPlugin({
        filename: 'stats-manifest.json',
      })
    ].filter(Boolean),
  };
};
