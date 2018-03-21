// Dependencies
const {
  NamedModulesPlugin,
  NoEmitOnErrorsPlugin,
} = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');
const paths = require('../paths');

// Init
const isDev = process.env.NODE_ENV !== 'production';

// Exports
module.exports = {
  mode: isDev ? 'development' : 'production',
  bail: !isDev,
  context: paths.appDirectory,
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
              { loader: require.resolve('css-loader'), options: { importLoaders: 1 } },
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
    new NoEmitOnErrorsPlugin(),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
  ].filter(e => e),
  // optimization:
  //   { noEmitOnErrors: true,
  //     concatenateModules: false,
  //     namedModules: true,
  //     splitChunks: { chunks: 'all' },
  //     runtimeChunk: { name: 'webpack_runtime' },
  //     minimize: false,
  //     minimizer: [] } }
};
