// Dependencies
const {
  EnvironmentPlugin,
  NamedModulesPlugin,
  DefinePlugin,
} = require('webpack');
const merge = require('webpack-merge');
const WriteFilePlugin = require('write-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const defaultsDeep = require('lodash.defaultsdeep');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const path = require('path');
const common = require('./common.js');
const paths = require('../paths');

// Init
const isDev = process.env.NODE_ENV !== 'production';
const defaultOpts = {
  targetDir: paths.client.targetDir,
  sourceDir: paths.client.sourceDir,
  entry: paths.client.entries.app,
  template: paths.client.templates,
  devPort: 8080,
};

// Exports
module.exports = (options) => {
  const opts = defaultsDeep({}, options, defaultOpts);
  const outputFilename = isDev ? 'bundle.js' : path.extname(opts.entry) ? path.basename(opts.entry) : `${path.basename(opts.entry)}.js`;
  const publicPath = isDev ? `http://localhost:${opts.devPort}/` : `/${path.dirname(opts.entry)}`;
  return merge.smart(common, {
    target: 'web',
    devtool: isDev ? 'cheap-module-source-map' : 'none',
    devServer: {
      port: opts.devPort,
      compress: true,
      clientLogLevel: 'none',
      quiet: true,
      contentBase: opts.targetDir,
      watchContentBase: false,
      publicPath,
      hot: true,
      overlay: true,
      watchOptions: {
        ignored: ignoredFiles(paths.appSrc),
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      before(app) {
        app.use(errorOverlayMiddleware());
        app.use(noopServiceWorkerMiddleware());
      },
    },
    performance: false,
    entry: [
      isDev && require.resolve('react-dev-utils/webpackHotDevClient'),
      require.resolve(path.resolve(opts.sourceDir, opts.entry)),
    ].filter(e => e),
    output: {
      path: path.dirname(path.resolve(opts.targetDir, opts.entry)),
      filename: isDev ? outputFilename : 'static/js/[name].[chunkhash:8].js',
      chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
      pathinfo: true,
      publicPath,
      libraryTarget: 'var',
    },
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
                  browsers: [
                    '>1%',
                    'last 2 versions',
                    'ie >= 11',
                  ],
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
        BUILD_TARGET: 'client',
        DEBUG: false,
      }),
      isDev && new NamedModulesPlugin(),
      isDev && new WriteFilePlugin({ log: true }),
      isDev && new DefinePlugin({ 'window.location.port': opts.devPort }),
      new ExtractTextPlugin({
        disable: isDev,
        filename: 'static/css/[name].[contenthash:8].css',
        allChunks: true,
      }),
      new HtmlWebpackPlugin({ // Inject script to index.hbs template
        inject: true,
        template: `!!${require.resolve('html-loader')}!${path.join(paths.templates.sourceDir, paths.templates.entries.app)}`,
        filename: path.join(paths.templates.targetDir, paths.templates.entries.app),
        // favicon: paths.assets.favicon,
        minify: !isDev && {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
    ].filter(Boolean),
    optimization: isDev
      ? {}
      : {
        minimizer: [
          new UglifyJSPlugin({
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
