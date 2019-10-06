import webpack, { Configuration, DefinePlugin, EnvironmentPlugin, Plugin } from 'webpack';
import zlib from 'zlib';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest';
import CompressionPlugin from 'compression-webpack-plugin';
import ImageminPlugin from 'imagemin-webpack-plugin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import { defaults } from 'lodash';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware';
import ignoredFiles from 'react-dev-utils/ignoredFiles';
import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import WebpackVaranAssetsManifest from '../lib/WebpackVaranAssetsManifest';
import createCommonConfig from './createCommonConfig';

// Types
export interface ClientOptions {
  appDir: string;
  name?: string;
  entry: string;
  env: Configuration['mode'];
  target: Configuration['target'];
  pwaManifest: WebpackPwaManifest.ManifestOptions | false;
  targetDir: string;
  sourceDir: string;
  devServerPort: number;
  serverPort: number;
  buildVars: {
    [key: string]: string;
  };
  analyze: boolean;
}

// Init
const getOpts = (options: Partial<ClientOptions>): ClientOptions => {
  const appDir = options.appDir || process.cwd();
  const resolve = (relativePath: string) => path.resolve(appDir, relativePath);
  return defaults({}, options, {
    analyze: false,
    appDir: resolve('./'),
    buildVars: {},
    entry: 'index',
    env: process.env.NODE_ENV,
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
    devServerPort: process.env.DEV_PORT || 3000,
    serverPort: process.env.PORT || 3001,
  });
};

/**
 * Create a webpack configuration optimized for client (browser) applications
 *
 * @param {{ analyze: boolean=, appDir: string=, buildVars: object=, entry: string=, env: 'development' | 'test' | 'production'=, target: 'web' | 'node'=, name: string=, pwaManifest: object=, targetDir: string=, sourceDir: string=, devServerPort: number=, serverPort: number= }=} options
 * @returns {webpack.Configuration}
 */
export default (options: Partial<ClientOptions> = {}): webpack.Configuration => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const publicPath = isDev ? `http://localhost:${opts.devServerPort}/` : `/${path.dirname(opts.entry).substr(2)}`;
  const outputPath = path.resolve(opts.targetDir);
  const name = opts.name || path.basename(opts.entry);
  return merge.smart(createCommonConfig(opts), {
    name,
    devtool: isDev ? 'cheap-module-source-map' : false,
    devServer: {
      proxy: {
        '/': `http://localhost:${opts.serverPort}/`,
      },
      historyApiFallback: true,
      compress: true,
      clientLogLevel: 'warn' as 'warning',
      quiet: true,
      noInfo: true,
      stats: 'errors-only',
      overlay: true,
      contentBase: opts.targetDir,
      watchContentBase: false,
      publicPath,
      progress: false,
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
    } as WebpackDevServer.Configuration,
    performance: false,
    entry: [require.resolve('react-app-polyfill/ie11'), path.resolve(opts.sourceDir, opts.entry)].filter(Boolean),
    output: {
      path: outputPath,
      filename: isDev ? 'dev-bundle.js' : 'static/js/[name].[contenthash:8].js',
      chunkFilename: isDev ? '[name].[contenthash:8].chunk.js' : 'static/js/[name].[contenthash:8].chunk.js',
      pathinfo: isDev,
      publicPath,
      libraryTarget: 'var',
      crossOriginLoading: 'anonymous',
    },
    plugins: [
      new DefinePlugin({
        BUILD_TARGET: JSON.stringify('client'),
        'process.env.BABEL_ENV': JSON.stringify(opts.env),
        'process.env.NODE_ENV': JSON.stringify(opts.env),
        'process.env.browser': JSON.stringify(true),
        ...Object.entries(process.env)
          .filter(([key]) => key.startsWith('APP_BUILD_VAR_') || key.startsWith('REACT_APP_'))
          .reduce<{ [key: string]: string | undefined }>((acc, [key, value]) => {
            acc[`process.env.${key}`] = value;
            return acc;
          }, {}),
        ...opts.buildVars,
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
        zlib.brotliCompress &&
        new CompressionPlugin({
          filename: '[path].br[query]',
          algorithm: 'brotliCompress',
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
      new StatsWriterPlugin({
        filename: 'stats-manifest.json',
        fields: ['assetsByChunkName', 'assets'],
      }),
      new WebpackVaranAssetsManifest({
        output: 'asset-manifest.json',
        integrity: true,
        integrityHashes: ['sha512'],
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
          directoryIndex: false as any,
          dynamicUrlToDependencies: {
            [publicPath]: [`${outputPath}/stats-manifest.json`],
          },
          navigateFallback: publicPath,
          navigateFallbackWhitelist: [/^(?!\/__).*/],
          staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/, /stats-manifest\.json$/, /\.gz$/, /\.br$/],
          runtimeCaching: [
            {
              handler: 'fastest',
              urlPattern: /\/*/,
            },
          ],
          logger(message: string) {
            if (message.startsWith('Total precache size is') || message.startsWith('Skipping static resource')) return;
            // eslint-disable-next-line no-console
            console.log(message);
          },
        }),
      opts.analyze && new BundleAnalyzerPlugin(),
    ].filter(Boolean) as Plugin[],
    optimization: isDev
      ? {
          namedModules: true,
          noEmitOnErrors: true,
          splitChunks: {
            chunks: 'all',
          },
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
                } as any,
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
