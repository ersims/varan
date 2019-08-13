/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

// Types
interface ConfigAPI {
  env: () => string;
}

// Init
let corejs: string;
try {
  corejs = require(require.resolve('core-js/package.json', { paths: [process.cwd()] })).version;
} catch (err) {
  throw new Error('Peer dependency "core-js" or "core-js-pure" is required!');
}

// Exports
export = (api: ConfigAPI) => {
  const isTest = api.env() === 'test';
  const isProd = api.env() === 'production';
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          corejs,
          modules: isTest && 'commonjs',
          shippedProposals: true,
          useBuiltIns: 'usage',
        },
      ],
      require.resolve('@babel/preset-typescript'),
      require.resolve('@babel/preset-react'),
    ],
    plugins: [
      [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent: `${require.resolve('@svgr/webpack')}?-svgo,+ref![path]`,
            },
          },
        },
      ],
      require.resolve('@babel/plugin-transform-runtime'),
      require.resolve('@babel/plugin-proposal-class-properties'),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      !isProd && require.resolve('@babel/plugin-transform-react-jsx-source'),
      !isProd && require.resolve('@babel/plugin-transform-react-jsx-self'),
      isProd && require.resolve('@babel/plugin-transform-react-constant-elements'),
      isProd && require.resolve('@babel/plugin-transform-react-inline-elements'),
      isProd && require.resolve('babel-plugin-transform-react-remove-prop-types'),
    ].filter(Boolean),
  };
};
