module.exports = {
  presets: [require('varan/babel/server')],
  overrides: [
    {
      test: ['./src/client'],
      presets: [require('varan/babel/client')],
    },
  ],
};
