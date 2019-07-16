import preset from '../../src';

// Init
const mockRunner = (env: string) =>
  preset({
    env() {
      return env;
    },
  });

// Tests
it('should configure preset-env according to environment', () => {
  const devOut = mockRunner('development');
  const testOut = mockRunner('test');
  const prodOut = mockRunner('production');

  // Assertions
  expect(devOut.presets).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([require.resolve('@babel/preset-env'), expect.objectContaining({ modules: false })]),
    ]),
  );
  expect(testOut.presets).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([require.resolve('@babel/preset-env'), expect.objectContaining({ modules: 'commonjs' })]),
    ]),
  );
  expect(prodOut.presets).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([require.resolve('@babel/preset-env'), expect.objectContaining({ modules: false })]),
    ]),
  );
});
it('should include generic plugins and presets in any mode', () => {
  const devOut = mockRunner('development');
  const testOut = mockRunner('test');
  const prodOut = mockRunner('production');
  const genericPresets = [require.resolve('@babel/preset-typescript'), require.resolve('@babel/preset-react')];
  const genericPlugins = [
    expect.arrayContaining([
      require.resolve('babel-plugin-named-asset-import'),
      expect.objectContaining({
        loaderMap: {
          svg: expect.objectContaining({}),
        },
      }),
    ]),
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-syntax-dynamic-import'),
  ];

  // Assertions
  expect(devOut.plugins).toEqual(expect.arrayContaining(genericPlugins));
  expect(devOut.presets).toEqual(expect.arrayContaining(genericPresets));
  expect(testOut.plugins).toEqual(expect.arrayContaining(genericPlugins));
  expect(testOut.presets).toEqual(expect.arrayContaining(genericPresets));
  expect(prodOut.plugins).toEqual(expect.arrayContaining(genericPlugins));
  expect(prodOut.presets).toEqual(expect.arrayContaining(genericPresets));
});
it('should only use development plugins when not in production mode', () => {
  const devOut = mockRunner('development');
  const testOut = mockRunner('test');
  const prodOut = mockRunner('production');

  // Assertions
  expect(devOut.plugins).toEqual(
    expect.arrayContaining([
      require.resolve('@babel/plugin-transform-react-jsx-source'),
      require.resolve('@babel/plugin-transform-react-jsx-self'),
    ]),
  );
  expect(testOut.plugins).toEqual(
    expect.arrayContaining([
      require.resolve('@babel/plugin-transform-react-jsx-source'),
      require.resolve('@babel/plugin-transform-react-jsx-self'),
    ]),
  );
  expect(prodOut.plugins).not.toEqual(
    expect.arrayContaining([
      require.resolve('@babel/plugin-transform-react-jsx-source'),
      require.resolve('@babel/plugin-transform-react-jsx-self'),
    ]),
  );
});
it('should only use production plugins when in production mode', () => {
  const devOut = mockRunner('development');
  const testOut = mockRunner('test');
  const prodOut = mockRunner('production');

  // Assertions
  expect(devOut.plugins).not.toEqual(
    expect.arrayContaining([
      require.resolve('@babel/plugin-transform-react-constant-elements'),
      require.resolve('@babel/plugin-transform-react-inline-elements'),
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
    ]),
  );
  expect(testOut.plugins).not.toEqual(
    expect.arrayContaining([
      require.resolve('@babel/plugin-transform-react-constant-elements'),
      require.resolve('@babel/plugin-transform-react-inline-elements'),
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
    ]),
  );
  expect(prodOut.plugins).toEqual(
    expect.arrayContaining([
      require.resolve('@babel/plugin-transform-react-constant-elements'),
      require.resolve('@babel/plugin-transform-react-inline-elements'),
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
    ]),
  );
});
