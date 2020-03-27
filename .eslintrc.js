module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    browser: false,
    es6: true,
  },
  overrides: [
    // Browser environments
    {
      files: ['**/src/client/**', 'examples/basic-static/src/**'],
      env: {
        browser: true,
      },
    },

    // Test environment
    {
      files: ['test/**', 'examples/**/test/**', 'packages/**/test/**'],
      env: {
        jest: true,
      },
      plugins: ['jest'],
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
      },
    },

    // Dev dependencies
    {
      files: [
        '*.js',
        'test/**',
        'types/**',
        'examples/**/test/**',
        'examples/**/types/**',
        'packages/**/test/**',
        'packages/**/types/**',
      ],
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      },
    },

    // JS Config
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  settings: {
    'import/extensions': ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    'import/ignore': [/node_modules/],
    'react/jsx-filename-extension': {
      extensions: ['.jsx', '.tsx'],
    },
    react: {
      version: '16',
    },
  },
  rules: {
    // Replaced by typescript equivalent below
    'no-useless-constructor': 0,
    '@typescript-eslint/no-useless-constructor': 'error',

    // Disabled as we prefer named exports
    'import/prefer-default-export': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    'lines-between-class-members': 0,
    'no-dupe-class-members': 0,
    'no-restricted-syntax': [2, 'LabeledStatement', 'WithStatement'],
    '@typescript-eslint/array-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-empty-interface': 0,

    // React stuff
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.jsx', '.tsx'],
      },
    ],
    'class-methods-use-this': [
      'error',
      {
        exceptMethods: [
          'componentDidMount',
          'shouldComponentUpdate',
          'componentDidUpdate',
          'render',
          'componentWillUnmount',
        ],
      },
    ],
  },
};
