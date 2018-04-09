// Dependencies
const {
  DefinePlugin,
  NoEmitOnErrorsPlugin,
} = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
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
  entry: [
    resolve('src/client/index.js'),
  ],
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
    rules: [{
      oneOf: [
        {
          test: /\.(js|jsx|mjs)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: false,
            compact: true,
            ...clientBabelConfig,
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
          test: /\.(css|scss)$/,
          use: ExtractTextPlugin.extract({
            fallback: require.resolve('style-loader'),
            use: [
              { loader: require.resolve('css-loader'), options: { importLoaders: 1, minimize: true } },
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
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin({
      filename: 'static/css/[name].[hash:8].css',
      allChunks: true,
    }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
  ],
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
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
