// Exports
module.exports = api => ({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: api.env() === 'test' ? 'commonjs' : false,
        shippedProposals: true,
        useBuiltIns: 'usage',
      },
    ],
    require.resolve('./common'),
  ],
});
