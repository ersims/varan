// Dependencies
const { DefinePlugin, EnvironmentPlugin } = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const defaults = require('lodash.defaults');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const convert = require('koa-connect');
const history = require('connect-history-api-fallback');
const proxy = require('http-proxy-middleware');
const path = require('path');
const common = require('./common.js');
const getPaths = require('../src/lib/getPaths');
const clientBabelPreset = require('../babel/client');
const { browsers } = require('../index');

// Init
const getOpts = options => {
  const paths = getPaths(options.cwd);
  return defaults({}, options, {
    browsers,
    env: process.env.NODE_ENV,
    name: undefined,
    appDir: paths.appDir,
    appSourceDir: paths.appSourceDir,
    appTargetDir: paths.appTargetDir,
    targetDir: paths.client.targetDir,
    sourceDir: paths.client.sourceDir,
    entry: paths.client.entry,
    favicon: paths.client.favicon,
    devServerPort: process.env.DEV_PORT || 3000,
    serverPort: process.env.PORT || 3001,
  });
};

// Exports
module.exports = options => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const publicPath = isDev ? `http://localhost:${opts.devServerPort}/` : `/${path.dirname(opts.entry).substr(2)}`;
  const outputPath = path.resolve(opts.targetDir);
  return merge.smart(common(opts), {
    target: 'web',
    name: opts.name || path.basename(opts.entry),
    devtool: isDev ? 'cheap-module-source-map' : 'none',
    // webpack-serve config - stripped before sending to webpack if it exists
    serve: {
      content: opts.targetDir,
      clipboard: false,
      logTime: true,
      logLevel: 'silent',
      hot: {
        logTime: true,
        logLevel: 'silent',
        reload: true,
        hmr: true,
      },
      dev: {
        watchOptions: {
          ignored: ignoredFiles(opts.sourceDir),
        },
        publicPath,
        logTime: true,
        logLevel: 'silent',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        writeToDisk: p => /^(?!.*(\.hot-update\.)).*/.test(p),
      },
      add: (app, middleware, options) => {
        app.use(convert(errorOverlayMiddleware()));
        app.use(convert(noopServiceWorkerMiddleware()));
        middleware.webpack();
        middleware.content();
        app.use(convert(proxy('/', { target: `http://localhost:${opts.serverPort}/` })));
        app.use(convert(history()));
      },
    },
    performance: false,
    entry: [require.resolve(path.resolve(opts.sourceDir, opts.entry))].filter(Boolean),
    output: {
      path: outputPath,
      filename: isDev ? 'dev-bundle.js' : 'static/js/[name].[chunkhash:8].js',
      chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
      pathinfo: isDev,
      publicPath,
      libraryTarget: 'var',
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|jsx|mjs)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: isDev,
            compact: !isDev,
            presets: [[clientBabelPreset, { browsers: opts.browsers }]],
          },
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        BUILD_TARGET: JSON.stringify('client'),
        'process.env.BABEL_ENV': JSON.stringify(opts.env),
        'process.env.NODE_ENV': JSON.stringify(opts.env),
      }),
      new EnvironmentPlugin({
        DEBUG: false,
      }),
      new ExtractTextPlugin({
        disable: isDev,
        filename: 'static/css/[name].[hash:8].css',
        allChunks: true,
      }),
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
      }),
    ].filter(Boolean),
    optimization: isDev
      ? {}
      : {
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
  });
};
