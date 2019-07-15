/* eslint-disable @typescript-eslint/no-var-requires */
const babel = require('@babel/core');
const preset = require('../../babel');

// Exports
module.exports = {
  process: (src, path) =>
    babel.transform(src, { presets: [preset], babelrc: false, envName: 'test', filename: path }).code,
};
