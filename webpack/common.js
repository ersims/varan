// Dependencies
const Fiber = require('fibers');
const { NamedModulesPlugin, NoEmitOnErrorsPlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const cssNano = require('cssnano');
const { defaults } = require('lodash');
const path = require('path');

// Init
const getOpts = options => {
  const appDir = options.appDir || process.cwd();
  const resolve = relativePath => path.resolve(appDir, relativePath);
  return defaults({}, options, {
    appDir: resolve('./'),
    env: process.env.NODE_ENV,
    target: 'web',
    cssModulesIdent: '[local]',
  });
};

// Exports
module.exports = options => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const isNode = opts.target === 'node';
  return {
    target: opts.target,
    mode: isDev ? 'development' : 'production',
    bail: !isDev,
    context: opts.appDir,
    resolve: {
      extensions: ['.js', '.jsx', '.mjs', '.json', '.ts', '.tsx'],
      alias: {
        '@babel/runtime': path.resolve(require.resolve('@babel/runtime/package.json'), '..'),
        'webpack-hot-client/client': require.resolve('webpack-hot-client/client'),
      },
    },
    output: {
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    performance: isDev ? { hints: false } : undefined,
    stats: 'errors-only',
    module: {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [
            {
              exclude: [/\.html$/, /\.(jsx?|mjs|tsx?)$/, /\.(sa|sc|c)ss$/, /\.json$/, /\.ico$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.(sa|sc|c)ss$/,
              use: [
                !isNode && { loader: isDev ? require.resolve('style-loader') : MiniCssExtractPlugin.loader },
                {
                  loader: isNode ? require.resolve('css-loader/locals') : require.resolve('css-loader'),
                  options: { modules: true, localIdentName: opts.cssModulesIdent, importLoaders: 3 },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    ident: 'postcss',
                    plugins: [postcssPresetEnv(), !isNode && !isDev && cssNano({ preset: 'default' })].filter(Boolean),
                  },
                },
                { loader: require.resolve('resolve-url-loader') },
                {
                  loader: require.resolve('sass-loader'),
                  options: {
                    sourceMap: true,
                    implementation: require('dart-sass'),
                    fiber: Fiber,
                  },
                },
              ].filter(Boolean),
            },
            {
              exclude: [/\.html$/, /\.(jsx?|mjs|tsx?)$/, /\.(sa|sc|c)ss$/, /\.json$/],
              loader: require.resolve('file-loader'),
              options: { name: 'static/media/[name].[hash:8].[ext]' },
            },
          ],
        },
      ],
    },
    plugins: [
      isDev && new NamedModulesPlugin(),
      new NoEmitOnErrorsPlugin(),
      new StatsWriterPlugin({
        filename: 'stats-manifest.json',
        fields: ['assetsByChunkName', 'assets'],
      }),
    ].filter(Boolean),
  };
};
