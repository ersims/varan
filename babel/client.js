module.exports = {
  extends: require.resolve('./common'),
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: [
            '>1%',
            'last 2 versions',
            'ie >= 11',
          ],
        },
        modules: false,
        shippedProposals: true,
      },
    ],
  ],
};
