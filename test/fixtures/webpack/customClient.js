// Dependencies
const { DefinePlugin, NoEmitOnErrorsPlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');
const clientBabelConfig = require('../../../babel/client');

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
  entry: [resolve('src/client/index.js')],
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
              presets: [clientBabelConfig],
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
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
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
    child_process: 'empty',
  },
};
