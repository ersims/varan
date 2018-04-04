module.exports = {
  extends: require.resolve('./common'),
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: 'current',
        },
        modules: false,
        shippedProposals: true,
      },
    ],
  ],
};
