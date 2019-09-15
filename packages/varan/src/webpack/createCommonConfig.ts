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
  cssModulesIdent: string;
}

// Init
const getOpts = (options: Partial<CommonOptions>): CommonOptions => {
  const appDir = options.appDir || process.cwd();
  const resolve = (relativePath: string) => path.resolve(appDir, relativePath);
  return defaults({}, options, {
    appDir: resolve('./'),
    env: process.env.NODE_ENV,
    target: 'web',
    cssModulesIdent: '[local]',
  });
};

// Exports
export default (options: Partial<CommonOptions>): Configuration => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const isNode = opts.target === 'node';
  const responsiveImages = [/\.jpe?g$/, /\.png$/];
  const images = [/\.bmp$/, /\.gif$/, /\.svg$/, /\.webp$/];
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
          test: /\.(jsx?|mjs|tsx?)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: isDev,
            presets: [[babelPreset]],
          },
        },

        /**
         * Styles
         * SASS, SCSS and CSS
         */
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            !isNode && (isDev ? { loader: require.resolve('style-loader') } : { loader: MiniCssExtractPlugin.loader }),
            {
              loader: require.resolve('css-loader'),
              options: {
                onlyLocals: isNode,
                importLoaders: 3,
                sourceMap: isDev,
                modules: {
                  localIdentName: opts.cssModulesIdent,
                },
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
            {
              loader: require.resolve('resolve-url-loader'),
              options: {
                keepQuery: true,
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
          ].filter(Boolean),
        },

        /**
         * Responsive images
         */
        {
          test: responsiveImages,
          loader: require.resolve('url-loader'),
          options: isDev
            ? {
                limit: 10000,
                name: 'static/media/[name].[width].[hash:8].[ext]',
                adapter: require('responsive-loader/sharp'),
              }
            : {
                limit: 10000,
                name: 'static/media/[name].[width].[hash:8].[ext]',
                fallback: require.resolve('responsive-loader'),
                adapter: require('responsive-loader/sharp'),
              },
        },

        /**
         * Fallback images
         */
        {
          test: images,
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
            fallback: require.resolve('file-loader'),
          },
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
            ...responsiveImages,
            ...images,
          ],
          loader: require.resolve('file-loader'),
          options: { name: 'static/media/[name].[hash:8].[ext]' },
        },
      ].filter(Boolean) as RuleSetRule[],
    },
  };
};