/* eslint-disable @typescript-eslint/no-var-requires */
// Dependencies
const { DefinePlugin, NoEmitOnErrorsPlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const path = require('path');
const babelConfig = require('babel-preset-varan');

// Init
const resolve = p => path.resolve(process.env.TEST_USER_CWD, p);

// Exports
module.exports = {
  mode: 'production',
  target: 'web',
  performance: false,
  bail: true,
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.json'],
  },
  devtool: 'cheap-module-source-map',
  entry: [resolve('src/client/index.jsx')],
  output: {
    path: resolve('dist/client'),
    filename: 'customFileName.js',
    chunkFilename: 'customFileName.[name].[chunkhash:8].chunk.js',
    pathinfo: true,
    publicPath: '/',
    libraryTarget: 'var',
  },
  stats: 'errors-only',
  module: {
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            test: /\.(js|jsx|mjs)$/,
            exclude: /node_modules/,
            loader: require.resolve('babel-loader'),
            options: {
              cacheDirectory: false,
              compact: true,
              presets: [babelConfig],
            },
          },
          {
            exclude: [/\.html$/, /\.(js|jsx|mjs)$/, /\.css$/, /\.scss$/, /\.json$/, /\.ico$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.(sa|sc|c)ss$/,
            use: [
              { loader: MiniCssExtractPlugin.loader },
              {
                loader: require.resolve('css-loader'),
                options: { modules: false },
              },
            ],
          },
          {
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: { name: 'static/media/[name].[hash:8].[ext]' },
          },
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new NoEmitOnErrorsPlugin(),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[hash:8].css',
      chunkFilename: 'static/css/[name].[hash:8].chunk.css',
    }),
    new WebpackAssetsManifest({
      output: 'asset-manifest.json',
      integrity: true,
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: true,
          output: {
            comments: false,
            // eslint-disable-next-line @typescript-eslint/camelcase
            ascii_only: true,
          },
        },
        sourceMap: true,
      }),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    // eslint-disable-next-line @typescript-eslint/camelcase
    child_process: 'empty',
  },
};
