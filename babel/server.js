// Get corejs version
let corejs;
try {
  corejs = require(require.resolve('core-js/package.json', { paths: [process.cwd()] })).version;
} catch (err) {
  throw new Error('Peer dependency "core-js" or "core-js-pure" is required!');
}

module.exports = api => ({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        corejs,
        targets: {
          node: 'current',
        },
        modules: api.env() === 'test' ? 'commonjs' : false,
        shippedProposals: true,
        useBuiltIns: 'usage',
      },
    ],
    require.resolve('./common'),
  ],
});
