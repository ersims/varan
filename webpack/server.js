// Dependencies
const { DefinePlugin, EnvironmentPlugin, HotModuleReplacementPlugin } = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const { defaults } = require('lodash');
const path = require('path');
const common = require('./common.js');
const serverBabelPreset = require('../babel/server');

// Init
const HotReloadEntry = `${require.resolve('webpack/hot/poll')}?1000`;
const getOpts = options => {
  const appDir = options.appDir || process.cwd();
  const resolve = relativePath => path.resolve(appDir, relativePath);
  return defaults({}, options, {
    appDir: resolve('./'),
    env: process.env.NODE_ENV,
    target: 'node',
    name: undefined,
    targetDir: resolve('dist/server'),
    sourceDir: resolve('src/server'),
    entry: 'bin/web',
    clientTargetDir: resolve('dist/client'),
  });
};

// Exports
module.exports = options => {
  const opts = getOpts(options);
  const isDev = opts.env !== 'production';
  const outputPath = path.resolve(opts.targetDir, path.dirname(opts.entry));
  return merge.smart(common(opts), {
    name: opts.name || path.basename(opts.entry),
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    entry: [isDev && HotReloadEntry, path.resolve(opts.sourceDir, opts.entry)].filter(Boolean),
    output: {
      path: outputPath,
      filename: `${path.basename(opts.entry, path.extname(opts.entry))}.js`,
      chunkFilename: 'chunks/[name].[contenthash:8].chunk.js',
      pathinfo: isDev,
      libraryTarget: 'commonjs2',
    },
    externals: [
      nodeExternals({
        modulesDir: path.resolve(process.cwd(), 'node_modules'),
        whitelist: [isDev && HotReloadEntry].filter(Boolean),
      }),
      nodeExternals({
        whitelist: [isDev && HotReloadEntry].filter(Boolean),
        modulesDir: path.resolve(__dirname, '..', 'node_modules'),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(jsx?|mjs|tsx?)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: isDev,
            presets: [serverBabelPreset],
            plugins: [
              [
                require.resolve('babel-plugin-named-asset-import'),
                {
                  loaderMap: {
                    svg: {
                      ReactComponent: require.resolve('@svgr/webpack') + '?-svgo,+ref![path]',
                    },
                  },
                },
              ],
            ],
          },
        },
      ],
    },
    plugins: [
      isDev && new HotModuleReplacementPlugin(),
      new DefinePlugin({
        BUILD_TARGET: JSON.stringify('server'),
        'process.env.BABEL_ENV': JSON.stringify(opts.env),
        'process.env.VARAN_CLIENT_ROOT': JSON.stringify(path.relative(outputPath, opts.clientTargetDir)),
        'process.env.VARAN_STATS_MANIFEST': JSON.stringify(
          path.relative(outputPath, path.resolve(opts.clientTargetDir, 'stats-manifest.json')),
        ),
        'process.env.VARAN_ASSETS_MANIFEST': JSON.stringify(
          path.relative(outputPath, path.resolve(opts.clientTargetDir, 'asset-manifest.json')),
        ),
      }),
      new EnvironmentPlugin({
        DEBUG: false,
      }),
      new StatsWriterPlugin({
        filename: 'stats-manifest.json',
        fields: ['assetsByChunkName', 'assets'],
      }),
    ].filter(Boolean),
    optimization: {
      namedModules: true,
      noEmitOnErrors: true,
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  });
};
