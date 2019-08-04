module.exports = {
  extends: '../../.eslintrc',
  overrides: [
    // Non-transpiled content
    {
      files: ['babel.js', 'babel/**', 'webpack/**'],
      rules: {
        'global-require': 0,
        '@typescript-eslint/no-var-requires': 0,
      },
    },
  ],
};
