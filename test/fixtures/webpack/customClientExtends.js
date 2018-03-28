// Dependencies
const merge = require('webpack-merge');
const clientConfig = require('../../../webpack/client');

// Exports
module.exports = options => merge.smartStrategy({ plugins: 'replace' })(clientConfig(options), {
  devtool: 'cheap-module-source-map',
  output: {
    filename: 'customExtendsFileName.js',
    chunkFilename: 'customExtendsFileName.[name].[chunkhash:8].chunk.js',
  },
  plugins: clientConfig(options).plugins.slice(0, -1),
});
