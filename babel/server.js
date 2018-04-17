module.exports = api => ({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: 'current',
        },
        modules: api.env() === 'test' ? 'commonjs' : false,
        shippedProposals: true,
      },
    ],
    require.resolve('./common'),
  ],
});
