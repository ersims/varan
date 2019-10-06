/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require('webpack-merge');
const createClientConfig = require('../../../src/webpack/createClientConfig').default;

// Exports
module.exports = options =>
  merge.smartStrategy({ plugins: 'replace' })(createClientConfig(options), {
    devtool: 'cheap-module-source-map',
    output: {
      filename: 'customExtendsFileName.js',
      chunkFilename: 'customExtendsFileName.[name].[chunkhash:8].chunk.js',
    },
    plugins: createClientConfig(options).plugins.slice(0, -1),
  });
