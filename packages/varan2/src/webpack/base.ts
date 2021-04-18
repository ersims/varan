import { RuleSetUseItem } from 'webpack';
import babelPreset from 'babel-preset-varan';
import { WebpackConfigurationFunction } from '../types/WebpackConfigurationFunction';
import { resolveAppRelativePath } from '../lib/resolveAppRelativePath';
import { getWebpackStyleLoaders } from '../lib/getWebpackStyleLoaders';

// Init
const sources = /\.(jsx?|mjs|tsx?)$/;

// Exports
export const base: WebpackConfigurationFunction = (env = {}, argv = {}) => {
  const mode = argv?.mode || 'production';
  const isDev = mode === 'development';
  const target = argv?.target;
  const isNode = target === 'node';
  return {
    mode,
    target,
    bail: !isDev,
    performance: isDev ? { hints: false } : undefined,
    // Source maps should be configured per config instead
    devtool: false,
    // Handle errors outside of webpack
    stats: 'errors-only',
    infrastructureLogging: {
      debug: false,
      level: 'error',
      // debug: true,
      // level: 'verbose',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.mjs', '.json', '.ts', '.tsx'],
    },
    output: {
      path: resolveAppRelativePath('dist'),
      pathinfo: isDev,
      globalObject: 'this',
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
            plugins: [isDev && require.resolve('react-refresh/babel')].filter(Boolean),
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
                mode: 'local',
                localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64:8]',
                exportOnlyLocals: isNode,
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
                mode: 'local',
                localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64:8]',
                exportOnlyLocals: isNode,
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
          use: ({ compiler }: { compiler: string }) =>
            [
              compiler !== 'HtmlWebpackCompiler' && {
                loader: require.resolve('file-loader'),
                options: { esModule: false, name: 'static/media/[name].[hash:8].[ext]' },
              },
            ].filter(Boolean) as RuleSetUseItem[],
        },
      ],
    },
    plugins: [
      // new WebpackManifestPlugin(),
      // new WebpackVaranAssetsManifestPlugin()
    ],
  };
};
