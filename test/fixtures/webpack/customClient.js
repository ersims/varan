// Dependencies
const merge = require('webpack-merge');
const clientConfig = require('../../../webpack/client');

// Exports
module.exports = options => merge.smart(clientConfig(options), {
  devtool: 'cheap-module-source-map',
  output: {
    filename: 'customFileName.js',
    chunkFilename: 'customFileName.[name].[chunkhash:8].chunk.js',
  },
});
