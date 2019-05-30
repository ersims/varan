// Get corejs version
let corejs;
try {
  // eslint-disable-next-line import/no-dynamic-require
  corejs = require(require.resolve('core-js/package.json', { paths: [process.cwd()] })).version;
} catch (err) {
  throw new Error('Peer dependency "core-js" or "core-js-pure" is required!');
}

// Exports
module.exports = api => ({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        corejs,
        modules: api.env() === 'test' ? 'commonjs' : false,
        shippedProposals: true,
        useBuiltIns: 'usage',
      },
    ],
    require.resolve('./common'),
  ],
});
