// Use @babel/runtime-corejs2?
let corejs;
try {
  require.resolve('@babel/runtime-corejs2/package.json', { paths: [process.cwd()] });
  corejs = 2;
} catch (err) {}

module.exports = api => {
  const isDev = api.env() === 'development';
  const isProd = api.env() === 'production';
  return {
    presets: [require.resolve('@babel/preset-typescript'), require.resolve('@babel/preset-react')],
    plugins: [
      [require.resolve('@babel/plugin-transform-runtime'), { corejs }],
      require.resolve('@babel/plugin-proposal-class-properties'),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      isDev && require.resolve('@babel/plugin-transform-react-jsx-source'),
      isDev && require.resolve('@babel/plugin-transform-react-jsx-self'),
      isProd && require.resolve('@babel/plugin-transform-react-constant-elements'),
      isProd && require.resolve('@babel/plugin-transform-react-inline-elements'),
    ].filter(Boolean),
  };
};
