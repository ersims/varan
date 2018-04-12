module.exports = {
  presets: [
    require.resolve('@babel/preset-react'),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
  ],
  env: {
    development: {
      plugins: [
        require.resolve('@babel/plugin-transform-react-jsx-source'),
        require.resolve('@babel/plugin-transform-react-jsx-self'),
      ],
    },
    production: {
      plugins: [
        require.resolve('@babel/plugin-transform-react-constant-elements'),
        require.resolve('@babel/plugin-transform-react-inline-elements'),
      ],
    },
  },
};
