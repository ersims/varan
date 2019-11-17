const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');
const client = require('varan/webpack/client');

// Init
const sourceDir = path.resolve(__dirname, 'src');
const targetDir = path.resolve(__dirname, 'dist');

// Exports
module.exports = options =>
  merge(
    client({
      ...options,
      sourceDir,
      targetDir,
    }),
    {
      plugins: [
        new HtmlWebpackPlugin({
          inject: true,
          template: path.resolve(sourceDir, 'index.html'),
          minify: {
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
      ],
    },
  );
