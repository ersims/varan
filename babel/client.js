module.exports = api => ({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: ['>1%', 'last 2 versions', 'ie >= 11'],
        },
        modules: api.env() === 'test' ? 'commonjs' : false,
        shippedProposals: true,
      },
    ],
    require.resolve('./common'),
  ],
});
