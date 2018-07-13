// Dependencies
const babel = require('@babel/core');
const preset = require('varan/babel/server');

// Exports
module.exports = {
  process: (src, path) =>
    babel.transform(src, { presets: [preset], babelrc: false, envName: 'test', filename: path }).code,
};
