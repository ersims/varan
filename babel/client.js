// Dependencies
const { browsers } = require('../index');

// Exports
module.exports = (api, options = {}) => ({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: options.browsers || browsers,
        },
        modules: api.env() === 'test' ? 'commonjs' : false,
        shippedProposals: true,
      },
    ],
    require.resolve('./common'),
  ],
});
