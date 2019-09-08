const { DefinePlugin, EnvironmentPlugin } = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const CompressionPlugin = require('compression-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');
const { defaults } = require('lodash');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const path = require('path');
const common = require('./common');

// Init
const getOpts = options => {
  const appDir = options.appDir || process.cwd();
  const resolve = relativePath => path.resolve(appDir, relativePath);
  return defaults({}, options, {
    appDir: resolve('./'),
    env: process.env.NODE_ENV,
    analyze: false,
    target: 'web',
    name: undefined,
    // See https://github.com/arthurbergmz/webpack-pwa-manifest for more information on how to specify manifest
    // pwaManifest: {
    //   name: 'Varan Progressive Web App!',
    //   short_name: 'VaranPWA',
    //   description: 'My awesome Progressive Web App using Varan!',
    //   background_color: '#ffffff',
    //   icons: [],
    // },
    pwaManifest: false,
    targetDir: resolve('dist/client'),
    sourceDir: resolve('src/client'),
    entry: 'index',
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
  const name = opts.name || path.basename(opts.entry);
  return merge.smart(common(opts), {
    name,
    devtool: isDev ? 'cheap-module-source-map' : 'none',
    devServer: {
      proxy: {
        '/': `http://localhost:${opts.serverPort}/`,
      },
      compress: true,
      clientLogLevel: 'warn',
      quiet: true,
      noInfo: true,
      stats: 'errors-only',
      overlay: true,
      progress: false,
      contentBase: opts.targetDir,
      watchContentBase: false,
      publicPath,
      liveReload: false,
      hot: true,
      injectHot: true,
      writeToDisk: p => /^(?!.*(\.hot-update\.)).*/.test(p),
      lazy: false,
      watchOptions: {
        ignored: ignoredFiles(opts.sourceDir),
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
    entry: [require.resolve('react-app-polyfill/ie11'), path.resolve(opts.sourceDir, opts.entry)].filter(Boolean),
    output: {
      path: outputPath,
      filename: isDev ? 'dev-bundle.js' : 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
      pathinfo: isDev,
      publicPath,
      libraryTarget: 'var',
    },
    plugins: [
      new DefinePlugin({
        BUILD_TARGET: JSON.stringify('client'),
        'process.env.BABEL_ENV': JSON.stringify(opts.env),
        'process.env.NODE_ENV': JSON.stringify(opts.env),
        'process.env.browser': JSON.stringify(true),
      }),
      new EnvironmentPlugin({
        DEBUG: false,
      }),
      !isDev &&
        new CompressionPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: /(\.js|\.json|\.html|\.css|\.svg|\.eot)$/,
          threshold: 3 * 1024,
          minRatio: 0.8,
        }),
      !isDev &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      !isDev &&
        new ImageminPlugin({
          test: /\.(jpe?g|png|gif|svg)$/i,
          minFileSize: 10 * 1024,
          pngquant: { quality: '90' },
          optipng: null,
          jpegtran: null,
          plugins: [
            imageminMozjpeg({
              quality: 90,
              progressive: true,
            }),
          ],
        }),
      new WebpackAssetsManifest({
        output: 'asset-manifest.json',
        // integrity: true,
      }),
      new StatsWriterPlugin({
        filename: 'stats-manifest.json',
        fields: ['assetsByChunkName', 'assets'],
      }),
      opts.pwaManifest &&
        new WebpackPwaManifest({
          inject: false,
          fingerprints: !isDev,
          ...opts.pwaManifest,
        }),
      !isDev &&
        new SWPrecacheWebpackPlugin({
          cacheId: name,
          dontCacheBustUrlsMatching: /(\.\w{8}\.)/,
          filename: 'service-worker.js',
          minify: !isDev,
          mergeStaticsConfig: true,
          skipWaiting: true,
          clientsClaim: true,
          directoryIndex: false,
          dynamicUrlToDependencies: {
            [publicPath]: [`${outputPath}/stats-manifest.json`],
          },
          navigateFallback: publicPath,
          navigateFallbackWhitelist: [/^(?!\/__).*/],
          staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/, /stats-manifest\.json$/, /\.gz$/],
          runtimeCaching: [
            {
              handler: 'fastest',
              urlPattern: /\/*/,
            },
          ],
          logger(message) {
            if (message.startsWith('Total precache size is') || message.startsWith('Skipping static resource')) return;
            // eslint-disable-next-line no-console
            console.log(message);
          },
        }),
      opts.analyze && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
    optimization: isDev
      ? {
          namedModules: true,
          noEmitOnErrors: true,
        }
      : {
          noEmitOnErrors: true,
          minimizer: [
            new TerserPlugin({
              cache: true,
              parallel: true,
              terserOptions: {
                parse: {
                  // we want terser to parse ecma 8 code. However, we don't want it
                  // to apply any minfication steps that turns valid ecma 5 code
                  // into invalid ecma 5 code. This is why the 'compress' and 'output'
                  // sections only apply transformations that are ecma 5 safe
                  // https://github.com/facebook/create-react-app/pull/4234
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  // Disabled because of an issue with Uglify breaking seemingly valid code:
                  // https://github.com/facebook/create-react-app/issues/2376
                  // Pending further investigation:
                  // https://github.com/mishoo/UglifyJS2/issues/2011
                  comparisons: false,
                  // Disabled because of an issue with Terser breaking valid code:
                  // https://github.com/facebook/create-react-app/issues/5250
                  // Pending futher investigation:
                  // https://github.com/terser-js/terser/issues/120
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  ascii_only: true,
                },
              },
              sourceMap: true,
            }),
          ],
          splitChunks: {
            minSize: 30 * 1024,
            maxSize: 1024 * 1024,
            automaticNameDelimiter: '.',
            cacheGroups: {
              // Don't split css in vendor chunks by default due to potential ordering issues
              commons: {
                test: /[\\/]node_modules[\\/](.*)\.(?!(css|sass|scss|less)$)([^.]+$)/,
                name: 'vendor',
                chunks: 'all',
                priority: -5,
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
  });
};
