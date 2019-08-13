/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
const babel = require('@babel/core');
const preset = require('varan/babel');

// Exports
module.exports = {
  process: (src, path) =>
    babel.transform(src, { presets: [preset], babelrc: false, envName: 'test', filename: path }).code,
};
