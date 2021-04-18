import { SourceMapDevToolPlugin, WebpackPluginInstance } from 'webpack';
import { resolve } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity';
import { WebpackConfigurationFunction } from '../types/WebpackConfigurationFunction';
import { resolveAppRelativePath } from '../lib/resolveAppRelativePath';
import { base } from './base';
import { WebpackVaranAssetsManifestPlugin } from '../lib/WebpackVaranAssetsManifestPlugin';

// Init
const target = 'web';
const publicDir = 'public';
const distPath = resolveAppRelativePath('dist/web');
const publicPath = resolve(distPath, publicDir);

// Exports
export const web: WebpackConfigurationFunction = (env = {}, argv = {}) => {
  const isDev = argv?.mode === 'development';
  const baseConfig = base(env, { ...argv, target });
  const sockHost = 'localhost';
  const sockPath = '/ws';
  const sockPort = 3000;
  return {
    ...baseConfig,
    target,
    // TODO: should this be configurable?
    entry: resolveAppRelativePath('src/client/index'),
    output: {
      ...baseConfig.output,
      path: publicPath,
      filename: isDev ? 'static/js/dev-bundle.js' : 'static/js/[name].[contenthash:8].js',
      crossOriginLoading: 'anonymous',
    },
    devServer: {
      host: process.env.HOST || '0.0.0.0',
      port: sockPort,
      historyApiFallback: true,
      hot: true,
      compress: true,
      liveReload: false,
      // static: {
      //   publicPath: '/',
      //   directory: publicPath,
      //   watch: true,
      // },
      static: publicPath,
      dev: {
        publicPath: '/',
        stats: false,
        writeToDisk: (p: string) => /^(?!.*(\.hot-update\.)).*/.test(p),
      },
      client: {
        logging: 'warn',
        host: sockHost,
        port: sockPort,
        path: sockPath,
      },
      // proxy: {
      // '/': `http://localhost:${opts.serverPort}/`,
      // },
      // // clientLogLevel: 'warn',
      // // quiet: true,
      // // noInfo: true,
      // // stats: 'errors-only',
      // stats: true,
      // overlay: true,
      // contentBase: outputPath,
      // watchContentBase: false,
      // publicPath: '/',
      // progress: false,
      // liveReload: false,
      // hot: true,
      // injectHot: true,
      // writeToDisk: (p) => /^(?!.*(\.hot-update\.)).*/.test(p),
      // lazy: false,
      // watchOptions: {
      //   // ignored: ignoredFiles(opts.sourceDir),
      // },
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // },
      // before(app) {
      //   app.use(errorOverlayMiddleware());
      //   app.use(noopServiceWorkerMiddleware('/'));
      // },
    },
    plugins: [
      ...(baseConfig.plugins || []),
      new HtmlWebpackPlugin({
        inject: true,
        // TODO: Should this be configurable?
        template: resolveAppRelativePath('src/index.html'),
        xhtml: true,
        minify: isDev
          ? false
          : {
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
      !isDev &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      !isDev &&
        new CssMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
          },
        }),
      !isDev && new SubresourceIntegrityPlugin(),
      isDev &&
        new ReactRefreshWebpackPlugin({
          overlay: {
            // We purposefully do not support IE11
            useURLPolyfill: false,
            sockProtocol: 'ws',
            sockPath,
            sockHost,
            sockPort,
          },
        }),
      new SourceMapDevToolPlugin(),
      // TODO: Fix sourcemaps
      // new SourceMapDevToolPlugin({
      //   namespace: 'varanapp',
      //   // fileContext: publicDir,
      //   // Specify the filename so that the source map is not inlined.
      //   filename: isDev ? undefined : relative(publicPath, resolve(distPath,'sourcemaps/[file].map')),
      //   // filename: relative(publicPath, resolve(distPath,'sourcemaps/[file].map')),
      //   // append: isDev ? undefined : null,
      //   // Prevent source content from being included in the source map.
      //   // noSources: isDev,
      //   // module: false,
      //   moduleFilenameTemplate: ({ namespace, resourcePath}: { resourcePath: string, absoluteResourcePath:string, namespace:string }) => {
      //     const normalizedResourcePath = normalize(resourcePath);
      //     return `file://${namespace}/${normalizedResourcePath.replace(/\\/g, '/')}`;
      //   },
      //   fallbackModuleFilenameTemplate: ({ namespace, resourcePath}: { resourcePath: string, absoluteResourcePath:string, namespace:string }) => {
      //     const normalizedResourcePath = normalize(resourcePath);
      //     return `file://${namespace}/${normalizedResourcePath.replace(/\\/g, '/')}`;
      //   },
      // }),
      new WebpackVaranAssetsManifestPlugin({ filename: '../varan.manifest.json' }),
    ].filter(Boolean) as WebpackPluginInstance[],
  };
};
