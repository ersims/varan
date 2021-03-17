import { resolve } from 'path';
import babelPreset from 'babel-preset-varan';
// import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import { WebpackConfigurationFunction } from '../types/WebpackConfigurationFunction';
import { resolveAppRelativePath } from '../lib/resolveAppRelativePath';
import { getWebpackStyleLoaders } from '../lib/getWebpackStyleLoaders';

// Init
const sources = /\.(jsx?|mjs|tsx?)$/;

// Exports
export const base: WebpackConfigurationFunction = (env = {}, argv = {}) => {
  // const mode = argv.mode || 'production';
  // const isDev = !env.production;
  const mode = 'production';
  const isDev = false;
  const isNode = argv?.target === 'node';
  return {
    mode,
    bail: !isDev,
    performance: isDev ? { hints: false } : undefined,
    stats: 'errors-only',
    resolve: {
      extensions: ['.js', '.jsx', '.mjs', '.json', '.ts', '.tsx'],
    },
    output: {
      path: resolveAppRelativePath('dist'),
      pathinfo: isDev,
      globalObject: 'this',

      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: (info: { absoluteResourcePath: string }): string =>
        `file://${resolve(info.absoluteResourcePath).replace(/\\/g, '/')}`,
    },
    module: {
      strictExportPresence: true,
      rules: [
        { test: sources, parser: { requireEnsure: false } },

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
          use: getWebpackStyleLoaders({ isDev, isNode }, { modules: false }),
        },

        /**
         * CSS Modules
         */
        {
          test: /\.module\.css$/,
          use: getWebpackStyleLoaders(
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
          use: getWebpackStyleLoaders(
            { isDev, isNode },
            { modules: false },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sourceMap: true,
                sassOptions: {
                  implementation: require.resolve('sass'),
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
          use: getWebpackStyleLoaders(
            { isDev, isNode },
            {
              modules: {
                localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64]',
              },
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sourceMap: true,
                sassOptions: {
                  implementation: require.resolve('sass'),
                },
              },
            },
          ),
        },

        /**
         * Fallback for all other files
         */
        {
          exclude: [/\.html$/, /\.(le|sa|sc|c)ss$/, /\.json$/, /\.(ejs|pug|hbs)$/, /\.(jsx?|mjs|tsx?)$/, /\.vue$/],
          loader: require.resolve('file-loader'),
          options: { esModule: false, name: 'static/media/[name].[hash:8].[ext]' },
        },
      ],
    },
    // TIO
    plugins: [
      // new WebpackManifestPlugin(),
      // new WebpackVaranAssetsManifestPlugin()
    ],
  };
};
