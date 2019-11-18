import { Configuration, RuleSetRule } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import postcssPresetEnv from 'postcss-preset-env';
import cssNano from 'cssnano';
import { defaults } from 'lodash';
import path from 'path';
import babelPreset from 'babel-preset-varan';

// Disable global require as we need it here
/* eslint-disable global-require */

// Types
export interface CommonOptions {
  appDir: string;
  env: Configuration['mode'];
  target: Configuration['target'];
}

// Init
const getOpts = (options: Partial<CommonOptions>): CommonOptions => {
  const appDir = options.appDir || process.cwd();
  const resolve = (relativePath: string) => path.resolve(appDir, relativePath);
  return defaults({}, options, {
    appDir: resolve('./'),
    env: process.env.NODE_ENV,
    target: 'web',
  });
};
const getStyleLoaders = (
  { isDev, isNode }: { isDev: boolean; isNode: boolean },
  cssOptions: { [key: string]: any },
  preProcessor?: { [key: string]: any },
) => {
  return [
    !isNode && (isDev ? { loader: require.resolve('style-loader') } : { loader: MiniCssExtractPlugin.loader }),
    {
      loader: require.resolve('css-loader'),
      options: {
        onlyLocals: isNode,
        importLoaders: preProcessor ? 3 : 1,
        sourceMap: isDev,
        localsConvention: 'camelCase',
        ...cssOptions,
      },
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: [postcssPresetEnv(), !isNode && !isDev && cssNano({ preset: 'default' })].filter(Boolean),
        sourceMap: isDev,
      },
    },
    !!preProcessor && {
      loader: require.resolve('resolve-url-loader'),
      options: {
        keepQuery: true,
      },
    },
    preProcessor,
  ].filter(Boolean);
};

// Exports
export default (options: Partial<CommonOptions>): Configuration => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const isNode = opts.target === 'node';
  const responsiveImages = [/\.jpe?g$/, /\.png$/];
  const images = [/\.bmp$/, /\.gif$/, /\.svg$/, /\.webp$/];
  const manifests = [/(\.webmanifest|browserconfig\.xml)$/];
  const sources = /\.(jsx?|mjs|tsx?)$/;
  const safeIssuers = [/\.(le|sa|sc|c)ss$/, /\.styl$/, /\.styl$/].concat(sources);
  return {
    target: opts.target,
    mode: isDev ? 'development' : 'production',
    bail: !isDev,
    context: opts.appDir,
    resolve: {
      extensions: ['.js', '.jsx', '.mjs', '.json', '.ts', '.tsx'],
      alias: {
        'webpack-hot-client/client': require.resolve('webpack-hot-client/client'),
      },
    },
    output: {
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: (info: { absoluteResourcePath: string }) =>
        `file://${path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')}`,
    },
    performance: isDev ? { hints: false } : undefined,
    stats: 'errors-only',
    module: {
      strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },

        /**
         * Transpile js files
         */
        {
          test: sources,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: isDev,
            presets: [[babelPreset]],
          },
        },

        /**
         * CSS Styles
         */
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: getStyleLoaders({ isDev, isNode }, { modules: false }),
        },

        /**
         * CSS Modules
         */
        {
          test: /\.module\.css$/,
          use: getStyleLoaders(
            { isDev, isNode },
            {
              modules: {
                localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64]',
              },
            },
          ),
        },

        /**
         * SASS & SCSS Styles
         */
        {
          test: /\.(sa|sc)ss$/,
          exclude: /\.module\.(sa|sc)ss$/,
          use: getStyleLoaders(
            { isDev, isNode },
            { modules: false },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sassOptions: {
                  implementation: require('sass'),
                },
              },
            },
          ),
        },

        /**
         * SASS & SCSS Modules
         */
        {
          test: /\.module\.(sa|sc)ss$/,
          use: getStyleLoaders(
            { isDev, isNode },
            {
              modules: {
                localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64]',
              },
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sassOptions: {
                  implementation: require('sass'),
                },
              },
            },
          ),
        },

        /**
         * Fallback images
         */
        {
          test: images,
          oneOf: [
            {
              issuer: safeIssuers,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
                fallback: require.resolve('file-loader'),
              },
            },
            {
              loader: require.resolve('file-loader'),
              options: { name: 'static/media/[name].[hash:8].[ext]' },
            },
          ],
        },

        /**
         * Responsive images
         */
        {
          test: responsiveImages,
          oneOf: [
            {
              issuer: safeIssuers,
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[width].[hash:8].[ext]',
                adapter: require('responsive-loader/sharp'),
                fallback: require.resolve('responsive-loader/sharp'),
              },
            },
            {
              loader: require.resolve('file-loader'),
              options: { name: 'static/media/[name].[hash:8].[ext]' },
            },
          ],
        },

        /**
         * Generate app manifests
         */
        {
          test: manifests,
          use: [
            {
              loader: require.resolve('file-loader'),
            },
            {
              loader: require.resolve('app-manifest-loader'),
            },
          ],
        },

        /**
         * Fallback for all other files
         */
        {
          exclude: [
            /\.html$/,
            /\.(le|sa|sc|c)ss$/,
            /\.json$/,
            /\.(ejs|pug|hbs)$/,
            /\.(jsx?|mjs|tsx?)$/,
            /\.vue$/,
            ...images,
            ...responsiveImages,
            ...manifests,
          ],
          loader: require.resolve('file-loader'),
          options: { name: 'static/media/[name].[hash:8].[ext]' },
        },
      ].filter(Boolean) as RuleSetRule[],
    },
  };
};
